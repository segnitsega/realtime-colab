import express, { Request, Response } from "express";
import { User } from "../models/user";
import { AppError } from "../utils/AppError";

export const usersRouter = express.Router();

usersRouter.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  res.status(200).json({
    success: true,
    message: "User fetched successfully",
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        online: user.online,
        lastActive: user.last_active,
        status: user.status,
        role: user.role,
      },
    },
  });
});
