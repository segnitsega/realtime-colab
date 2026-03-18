import express from "express";
import {
  getMeController,
  getUser,
  getUsers,
  updateMeController,
} from "../controllers/users.controller";

export const usersRouter = express.Router();

usersRouter.get("/", getUsers);

usersRouter.get("/me", getMeController);
usersRouter.put("/me", updateMeController);

usersRouter.get("/:id", getUser);
