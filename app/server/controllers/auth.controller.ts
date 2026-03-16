import { Request, Response } from "express";
import { signInSchema, signUpSchema } from "validation";
import { AppError } from "../utils/AppError";
import {
  signup,
  login,
  refreshAccessToken,
  getGoogleAuthUrl,
  handleGoogleCallback,
  getDiscordAuthUrl,
  handleDiscordCallback,
  getProfile,
  updateProfile,
  logout,
} from "../services/auth.service";

const ensureAuth = (req: Request): string => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);
  return userId;
};

export const signupController = async (req: Request, res: Response) => {
  const parsed = signUpSchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const message = Object.values(first).flat().join(". ") || "Validation failed";
    throw new AppError(message, 400);
  }
  const result = await signup(parsed.data);
  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: result,
  });
};

export const loginController = async (req: Request, res: Response) => {
  const parsed = signInSchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const message = Object.values(first).flat().join(". ") || "Validation failed";
    throw new AppError(message, 400);
  }
  const result = await login(parsed.data);
  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
};

export const refreshController = async (req: Request, res: Response) => {
  try {
    const refreshToken =
      req.headers["authorization"]?.split(" ")[1];
    const result = await refreshAccessToken(refreshToken ?? "");
    res.status(200).json({
      message: "Token refreshed",
      token: result.token,
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Server error", 500);
  }
};

export const googleAuthController = (_req: Request, res: Response) => {
  res.redirect(getGoogleAuthUrl());
};

export const googleCallbackController = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const result = await handleGoogleCallback(code);
    res.status(200).json({
      success: true,
      message: "Google OAuth Login successful",
      data: result,
    });
  } catch (error) {
    console.error("OAuth Error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

export const discordAuthController = (_req: Request, res: Response) => {
  res.redirect(getDiscordAuthUrl());
};

export const discordCallbackController = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const result = await handleDiscordCallback(code);
    res.status(200).json({
      success: true,
      message: "Discord OAuth Login successful",
      data: result,
    });
  } catch (error) {
    console.error("Discord OAuth Error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

export const getMeController = async (req: Request, res: Response) => {
  const user = await getProfile(req.user!.id);
  res.status(200).json({
    success: true,
    message: "Current user profile fetched successfully",
    data: { user },
  });
};

export const updateMeController = async (req: Request, res: Response) => {
  const user = await updateProfile(req.user!.id, req.body);
  res.status(200).json({
    success: true,
    message: "User profile updated successfully",
    data: { user },
  });
};

export const logoutController = async (req: Request, res: Response) => {
  await logout(req.user!.id);
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
