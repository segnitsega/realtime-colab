import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import { authMiddleware } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";
import { authRouter } from "./routes/auth.route";
import { apiRouter } from "./api.router";
import { initSocket } from "./realtime/socket";
import { Server } from "socket.io";
import { createServer } from "http";
import { setSocketInstance } from "./realtime/channel.events";

dotenv.config();

const startServer = async () => {
  try {
    await connectDB();

    const app = express();

    app.use(helmet());
    app.use(cors());
    app.use(express.json({ limit: "10mb" }));

    const apiLimiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
    });

    app.use("/api", apiLimiter);

    app.get("/health", (req, res) => res.send("OK"));

    app.use("/auth", authRouter);

    app.use("/api", authMiddleware, apiRouter);

    app.use(errorHandler);

    const httpServer = createServer(app);
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL,
        credentials: true,
      },
    });
    
    setSocketInstance(io);
    initSocket(io);

    httpServer.listen(3000, () =>
      console.log("HTTP server running on port 3000"),
    );
  } catch (e) {
    console.log("Server startup failed", e);
    process.exit(1);
  }
};

startServer();
