import { User } from "../models/user";
import { AppError } from "../utils/AppError";

export const getUserById = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};

export const getAllUsers = async () => {
  const users = await User.find();
  if(!users){
    throw new AppError("No users found", 404);
  }
  return users
}

export const getProfile = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  return {
    id: user._id,
    displayName: user.displayName,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    status: user.status,
    role: user.role,
  };
};

export const updateProfile = async (
  userId: string,
  data: {
    displayName?: string;
    username?: string;
    email?: string;
    avatarUrl?: string;
    avatar_url?: string;
    bio?: string;
    status?: string;
  },
) => {
  const updates: {
    displayName?: string;
    username?: string;
    email?: string;
    avatar_url?: string;
    bio?: string;
    status?: string;
  } = {};

  if (data.displayName !== undefined) updates.displayName = data.displayName?.trim() || undefined;
  if (data.username) {
    const existing = await User.findOne({
      username: data.username,
      _id: { $ne: userId },
    });
    if (existing) throw new AppError("Username is already taken", 409);
    updates.username = data.username;
  }

  if (data.email) {
    const existing = await User.findOne({
      email: data.email,
      _id: { $ne: userId },
    });
    if (existing) throw new AppError("Email is already registered", 409);
    updates.email = data.email;
  }

  if (data.avatarUrl !== undefined || data.avatar_url !== undefined) {
    updates.avatar_url = data.avatarUrl ?? data.avatar_url;
  }
  if (data.bio !== undefined) updates.bio = data.bio;
  if (data.status !== undefined) updates.status = data.status;

  const updatedUser = await User.findByIdAndUpdate(userId, updates, {
    new: true,
  });
  if (!updatedUser) throw new AppError("User not found", 404);

  return {
    id: updatedUser._id,
    displayName: updatedUser.displayName,
    username: updatedUser.username,
    email: updatedUser.email,
    avatarUrl: updatedUser.avatar_url,
    bio: updatedUser.bio,
    status: updatedUser.status,
    role: updatedUser.role,
  };
};