import express, { Request, Response } from "express";
import { usersRouter } from "./routes/users.route";

export const apiRouter = express.Router();

apiRouter.use("/users", usersRouter);
