import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { AppError } from "../utils/AppError";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; username: string };
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const token =
    req.cookies?.token ?? req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return next(new AppError("No authentication token provided", 401));
  }

  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    return next(new AppError("Server configuration error", 500));
  }

  jwt.verify(
    token,
    secretKey,
    (
      error: VerifyErrors | null,
      decodedUser: string | JwtPayload | undefined,
    ) => {
      if (error) {
        return next(new AppError("Invalid or expired token", 401));
      }

      req.user = decodedUser as { id: string; username: string };

      next();
    },
  );
};