import express from "express";
import { getUser } from "../controllers/users.controller";

export const usersRouter = express.Router();

usersRouter.get("/:id", getUser);
