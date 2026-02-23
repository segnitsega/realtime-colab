import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
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

  if (!user.passwordHash) {
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
