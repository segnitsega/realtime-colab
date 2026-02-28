import { URLSearchParams } from "url";
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