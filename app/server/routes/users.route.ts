import express from "express";
import { getUser, getUsers } from "../controllers/users.controller";

export const usersRouter = express.Router();

usersRouter.get("/", getUsers)
usersRouter.get("/:id", getUser);
