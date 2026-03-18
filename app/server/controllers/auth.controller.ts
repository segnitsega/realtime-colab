import { Request, Response } from "express";
import jwt from "jsonwebtoken";
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
  logout,
} from "../services/auth.service";

const ensureAuth = (req: Request): string => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Unauthorized", 401);
  return userId;
};

const isProd = process.env.NODE_ENV === "production";

const sanitizeRedirectPath = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return null;
  if (trimmed.startsWith("//")) return null;
  return trimmed;
};

const createOAuthState = (redirectPath: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret)
    throw new AppError("Server configuration error: Missing JWT secrets", 500);
  return jwt.sign({ redirect: redirectPath }, secret, { expiresIn: "10m" });
};

const readOAuthRedirectFromState = (state: unknown): string | null => {
  if (typeof state !== "string" || !state) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    const decoded = jwt.verify(state, secret) as { redirect?: unknown };
    return sanitizeRedirectPath(decoded?.redirect);
  } catch {
    return null;
  }
};

export const signupController = async (req: Request, res: Response) => {
  const parsed = signUpSchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const message =
      Object.values(first).flat().join(". ") || "Validation failed";
    throw new AppError(message, 400);
  }
  const result = await signup(parsed.data);

  res.cookie("token", result.token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 2 * 60 * 60 * 1000,
  });

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: {
      user: result.user,
    },
  });
};

export const loginController = async (req: Request, res: Response) => {
  const parsed = signInSchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const message =
      Object.values(first).flat().join(". ") || "Validation failed";
    throw new AppError(message, 400);
  }
  const result = await login(parsed.data);

  res.cookie("token", result.token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 2 * 60 * 60 * 1000,
  });

  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: result.user,
    },
  });
};

export const refreshController = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken ?? "";
    const result = await refreshAccessToken(refreshToken);

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Token refreshed",
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Server error", 500);
  }
};

export const googleAuthController = (req: Request, res: Response) => {
  const redirectPath = sanitizeRedirectPath(req.query.redirect) ?? "/channels";
  const state = createOAuthState(redirectPath);
  res.redirect(getGoogleAuthUrl(state));
};

export const googleCallbackController = async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const result = await handleGoogleCallback(code);

    const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";
    const redirectPath =
      readOAuthRedirectFromState(req.query.state) ?? "/channels";
    const redirectUrl = new URL(redirectPath, clientUrl);
    redirectUrl.searchParams.set("token", result.token);
    redirectUrl.searchParams.set("refreshToken", result.refreshToken);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("OAuth Error:", error);
    const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";
    const redirectUrl = new URL("/auth/signin", clientUrl);
    redirectUrl.searchParams.set("error", "google_oauth_failed");
    res.redirect(redirectUrl.toString());
  }
};

export const discordAuthController = (_req: Request, res: Response) => {
  const redirectPath =
    sanitizeRedirectPath(_req.query.redirect) ??
    sanitizeRedirectPath(_req.query.next) ??
    "/channels";
  const state = createOAuthState(redirectPath);
  res.redirect(getDiscordAuthUrl(state));
};

export const discordCallbackController = async (
  req: Request,
  res: Response,
) => {
  try {
    const code = req.query.code as string;
    const result = await handleDiscordCallback(code);

    const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";
    const redirectPath =
      readOAuthRedirectFromState(req.query.state) ?? "/channels";
    const redirectUrl = new URL(redirectPath, clientUrl);
    redirectUrl.searchParams.set("token", result.token);
    redirectUrl.searchParams.set("refreshToken", result.refreshToken);

    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("Discord OAuth Error:", error);
    const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";
    const redirectUrl = new URL("/auth/signin", clientUrl);
    redirectUrl.searchParams.set("error", "discord_oauth_failed");
    res.redirect(redirectUrl.toString());
  }
};

export const logoutController = async (req: Request, res: Response) => {
  await logout(req.user!.id);
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
