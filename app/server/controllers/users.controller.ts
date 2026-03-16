import { Request, Response } from "express";
import { getAllUsers, getUserById } from "../services/users.service";

export const getUser = async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const user = await getUserById(id);
  res.status(200).json({
    success: true,
    message: "User fetched successfully",
    data: {
      user: {
        id: user._id,
        displayName: user.displayName,
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
};

export const getUsers = async (req: Request, res: Response) => {
  const users = await getAllUsers();
  res.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: {
      users: users.map((user) => ({
        id: user._id,
        displayName: user.displayName,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatar_url,
        bio: user.bio,
        online: user.online,
        lastActive: user.last_active,
        status: user.status,
        role: user.role,
      })),
    },
  });
};
