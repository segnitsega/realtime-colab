import { User } from "../models/user";
import { AppError } from "../utils/AppError";

export const getUserById = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError("User not found", 404);
  }
  return user;
};
