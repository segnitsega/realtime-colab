import express, { Request, Response } from "express";
import { usersRouter } from "./routes/users.route";
import { guildsRouter } from "./routes/guilds.route";
import { channelRouter } from "./routes/channels.route";

export const apiRouter = express.Router();

apiRouter.use("/users", usersRouter);
apiRouter.use("/guilds", guildsRouter);
apiRouter.use("/channels", channelRouter);

