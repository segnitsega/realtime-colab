import express from "express";
import { authMiddleware } from "../middleware/auth";
import {
  signupController,
  loginController,
  refreshController,
  googleAuthController,
  googleCallbackController,
  discordAuthController,
  discordCallbackController,
  getMeController,
  updateMeController,
  logoutController,
} from "../controllers/auth.controller";

export const authRouter = express.Router();

authRouter.post("/signup", signupController);
authRouter.post("/login", loginController);
authRouter.get("/refresh", refreshController);

authRouter.get("/google", googleAuthController);
authRouter.get("/google/callback", googleCallbackController);

authRouter.get("/discord", discordAuthController);
authRouter.get("/discord/callback", discordCallbackController);

authRouter.get("/me", authMiddleware, getMeController);
authRouter.put("/me", authMiddleware, updateMeController);
authRouter.post("/logout", authMiddleware, logoutController);
