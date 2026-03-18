import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
import { AppError } from "../utils/AppError";

const getJwtSecrets = () => {
  const secretKey = process.env.JWT_SECRET;
  const refreshKey = process.env.JWT_REFRESH_SECRET;
  if (!secretKey || !refreshKey) {
    throw new AppError("Server configuration error: Missing JWT secrets", 500);
  }
  return { secretKey, refreshKey };
};

const createTokens = (userId: string, username: string) => {
  const { secretKey, refreshKey } = getJwtSecrets();
  const token = jwt.sign(
    { id: userId, username },
    secretKey,
    { expiresIn: "2h" },
  );

  const refreshToken = jwt.sign(
    { id: userId, username },
    refreshKey,
    { expiresIn: "7d" },
  );

  return { token, refreshToken };
};

export const signup = async (data: {
  displayName?: string;
  email: string;
  username: string;
  password: string;
}) => {
  const { displayName, email, username, password } = data;

  const existingEmail = await User.findOne({ email });
  if (existingEmail) throw new AppError("Email is already registered", 409);

  const existingUsername = await User.findOne({ username });
  if (existingUsername) throw new AppError("Username is already taken", 409);

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({
    displayName: displayName?.trim() || undefined,
    email,
    username,
    password: hashedPassword,
  });

  const { token, refreshToken } = createTokens(
    String(newUser._id),
    newUser.username,
  );

  newUser.refreshToken = refreshToken;
  await newUser.save();

  return {
    token,
    refreshToken,
    user: {
      id: newUser._id,
      displayName: newUser.displayName,
      username: newUser.username,
      email: newUser.email,
    },
  };
};

export const login = async (data: { email: string; password: string }) => {
  const { email, password } = data;

  const user = await User.findOne({ email });

  if (!user) throw new AppError("Invalid email or password", 401);

  if (!user.password) {
    throw new AppError("Please log in using your OAuth provider", 400);
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) throw new AppError("Invalid email or password", 401);

  const { token, refreshToken } = createTokens(
    String(user._id),
    user.username,
  );
  user.refreshToken = refreshToken;
  await user.save();

  return {
    token,
    refreshToken,
    user: {
      id: user._id,
      displayName: user.displayName,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatar_url,
    },
  };
};

export const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError("No refresh token provided", 401);
  }

  const { secretKey, refreshKey } = getJwtSecrets();

  const foundUser = await User.findOne({ refreshToken });
  if (!foundUser) throw new AppError("Invalid refresh token", 401);

  return new Promise<{ token: string }>((resolve, reject) => {
    jwt.verify(refreshToken, refreshKey, (error) => {
      if (error) {
        reject(new AppError("Invalid refresh token", 401));
        return;
      }
      const newAccessToken = jwt.sign(
        { id: foundUser._id, username: foundUser.username },
        secretKey,
        { expiresIn: "2h" },
      );
      resolve({ token: newAccessToken });
    });
  });
};

export const getGoogleAuthUrl = (state?: string) => {
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
    ...(state ? { state } : {}),
  };
  return `${rootUrl}?${new URLSearchParams(options).toString()}`;
};

export const handleGoogleCallback = async (code: string) => {
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
  if (!tokenResponse.ok) throw new AppError("Failed to fetch Google token", 400);

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
      displayName: googleUser.name ?? undefined,
      email: googleUser.email,
      username: `${baseUsername}_${randomSuffix}`,
      googleId: googleUser.id,
      avatar_url: googleUser?.picture,
    });
  } else if (!user.googleId) {
    user.googleId = googleUser.id;
  }

  const { token, refreshToken } = createTokens(
    String(user._id),
    user.username,
  );
  user.refreshToken = refreshToken;
  await user.save();

  return {
    token,
    refreshToken,
    user: {
      id: user._id,
      displayName: user.displayName,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatar_url,
    },
  };
};

export const getDiscordAuthUrl = (state?: string) => {
  const rootUrl = "https://discord.com/api/oauth2/authorize";
  const options = {
    client_id: process.env.DISCORD_CLIENT_ID as string,
    redirect_uri: process.env.DISCORD_REDIRECT_URI as string,
    response_type: "code",
    scope: ["identify", "email"].join(" "),
    ...(state ? { state } : {}),
  };
  return `${rootUrl}?${new URLSearchParams(options).toString()}`;
};

export const handleDiscordCallback = async (code: string) => {
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

  if (!tokenResponse.ok) {
    throw new AppError("Failed to fetch Discord token", 400);
  }
  const tokenData = await tokenResponse.json();

  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const discordUser = await userResponse.json();

  let user = await User.findOne({ email: discordUser.email });

  if (!user) {
    user = new User({
      displayName: discordUser.global_name ?? discordUser.username ?? undefined,
      email: discordUser.email,
      username: `${discordUser.username}_${Math.floor(Math.random() * 1000)}`,
      discordId: discordUser.id,
      avatar_url: `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`,
    });
  } else if (!user.discordId) {
    user.discordId = discordUser.id;
  }

  const { token, refreshToken } = createTokens(
    String(user._id),
    user.username,
  );
  user.refreshToken = refreshToken;
  await user.save();

  return {
    token,
    refreshToken,
    user: {
      id: user._id,
      displayName: user.displayName,
      username: user.username,
      email: user.email,
      avatarUrl: user.avatar_url,
    },
  };
};

export const logout = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  user.refreshToken = undefined;
  await user.save();
};
