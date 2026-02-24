import express, { Request, Response } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/user";
import { AppError } from "../utils/AppError";

export const authRouter = express.Router();

authRouter.post("/signup", async (req: Request, res: Response) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    throw new AppError("Email, username, and password are required", 400);
  }

  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new AppError("Email is already registered", 409);
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new AppError("Username is already taken", 409);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    email,
    username,
    password: hashedPassword,
  });

  const secretKey = process.env.JWT_SECRET;
  const refreshKey = process.env.JWT_REFRESH_SECRET;

  if (!secretKey || !refreshKey) {
    throw new AppError("Server configuration error: Missing JWT secrets", 500);
  }

  const token = jwt.sign(
    { id: newUser._id, username: newUser.username },
    secretKey,
    {
      expiresIn: "2h",
    },
  );

  const refreshToken = jwt.sign(
    { id: newUser._id, username: newUser.username },
    refreshKey,
    {
      expiresIn: "7d",
    },
  );

  newUser.refreshToken = refreshToken;
  await newUser.save();

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: {
      token,
      refreshToken,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    },
  });
});

authRouter.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.password) {
    throw new AppError("Please log in using your OAuth provider", 400);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const secretKey = process.env.JWT_SECRET;
  const refreshKey = process.env.JWT_REFRESH_SECRET;

  if (!secretKey || !refreshKey) {
    throw new AppError("Server configuration error: Missing JWT secrets", 500);
  }

  const token = jwt.sign({ id: user._id, username: user.username }, secretKey, {
    expiresIn: "2h",
  });

  const refreshToken = jwt.sign(
    { id: user._id, username: user.username },
    refreshKey,
    {
      expiresIn: "7d",
    },
  );

  user.refreshToken = refreshToken;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar_url,
      },
    },
  });
});

authRouter.get("/refresh", async (req: Request, res: Response) => {
  try {
    let refreshToken = req.headers["authorization"]?.split(" ")[1];
    if (!refreshToken) {
      throw new AppError("No refresh token provided", 401);
    }

    const secretKey = process.env.JWT_SECRET;
    const refreshKey = process.env.JWT_REFRESH_SECRET;

    if (!secretKey || !refreshKey) {
      throw new AppError(
        "Server configuration error: Missing JWT secrets",
        500,
      );
    }

    const foundUser = await User.findOne({ refreshToken });
    if (!foundUser) {
      throw new AppError("Invalid refresh token", 401);
    }

    jwt.verify(
      refreshToken,
      refreshKey,
      (
        error: VerifyErrors | null,
        decoded: string | JwtPayload | undefined,
      ) => {
        if (error) {
          throw new AppError("Invalid refresh token", 401);
        }

        const newAccessToken = jwt.sign(
          {
            id: foundUser._id,
            username: foundUser.username,
          },
          secretKey,
          { expiresIn: "2h" },
        );

        res.status(200).json({
          message: "Token refreshed",
          token: newAccessToken,
        });
      },
    );
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    } else {
      throw new AppError("Server error", 500);
    }
  }
});

authRouter.get("/google", (req: Request, res: Response) => {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI as string,
    response_type: "code",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options);
  res.redirect(`${rootUrl}?${qs.toString()}`);
});

authRouter.get("/google/callback", async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    if (!code) throw new AppError("No code provided from Google", 400);

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID as string,
        client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI as string,
        grant_type: "authorization_code",
        code,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok)
      throw new AppError("Failed to fetch Google token", 400);

    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      },
    );
    const googleUser = await userResponse.json();

    let user = await User.findOne({ email: googleUser.email });

    if (!user) {
      const baseUsername = googleUser.email.split("@")[0];
      const randomSuffix = Math.floor(Math.random() * 10000);

      user = new User({
        email: googleUser.email,
        username: `${baseUsername}_${randomSuffix}`,
        googleId: googleUser.id,
        avatar_url: googleUser?.picture,
      });
    } else if (!user.googleId) {
      user.googleId = googleUser.id;
    }

    const secretKey = process.env.JWT_SECRET as string;
    const refreshKey = process.env.JWT_REFRESH_SECRET as string;

    const token = jwt.sign(
      { id: user._id, username: user.username },
      secretKey,
      { expiresIn: "2h" },
    );
    const refreshToken = jwt.sign(
      { id: user._id, username: user.username },
      refreshKey,
      { expiresIn: "7d" },
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Google OAuth Login successful",
      data: {
        token,
        refreshToken,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatarUrl: user.avatar_url,
        },
      },
    });
  } catch (error) {
    console.error("OAuth Error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});

authRouter.get("/discord", (req: Request, res: Response) => {
  const rootUrl = "https://discord.com/api/oauth2/authorize";
  const options = {
    client_id: process.env.DISCORD_CLIENT_ID as string,
    redirect_uri: process.env.DISCORD_REDIRECT_URI as string,
    response_type: "code",
    scope: ["identify", "email"].join(" "),
  };

  const qs = new URLSearchParams(options);
  res.redirect(`${rootUrl}?${qs.toString()}`);
});

authRouter.get("/discord/callback", async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    if (!code) throw new AppError("No code provided from Discord", 400);

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID as string,
        client_secret: process.env.DISCORD_CLIENT_SECRET as string,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI as string,
      }),
    });

    if (!tokenResponse.ok)
      throw new AppError("Failed to fetch Discord token", 400);
    const tokenData = await tokenResponse.json();

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const discordUser = await userResponse.json();

    let user = await User.findOne({ email: discordUser.email });

    if (!user) {
      user = new User({
        email: discordUser.email,
        username: `${discordUser.username}_${Math.floor(Math.random() * 1000)}`,
        discordId: discordUser.id,
        avatar_url: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`,
      });
    } else if (!user.discordId) {
      user.discordId = discordUser.id;
    }

    const secretKey = process.env.JWT_SECRET as string;
    const refreshKey = process.env.JWT_REFRESH_SECRET as string;

    const token = jwt.sign(
      { id: user._id, username: user.username },
      secretKey,
      { expiresIn: "2h" },
    );
    const refreshToken = jwt.sign(
      { id: user._id, username: user.username },
      refreshKey,
      { expiresIn: "7d" },
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Discord OAuth Login successful",
      data: {
        token,
        refreshToken,
        user: { id: user._id, username: user.username, email: user.email },
        avatarUrl: user.avatar_url,
      },
    });
  } catch (error) {
    console.error("Discord OAuth Error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
});
