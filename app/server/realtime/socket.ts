import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";

export const initSocket = (io: Server) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) throw new AppError("Unauthorized", 401);

    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      socket.data.userId = decoded.id;
      next();
    } catch {
      throw new AppError("Unauthorized", 401);
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;

    console.log("User connected:", userId);

    socket.on("join:channel", ({ channelId }) => {
      socket.join(`channel:${channelId}`);
    });

    socket.on("leave:channel", ({ channelId }) => {
      socket.leave(`channel:${channelId}`);
    });

    socket.on("typing:start", ({ channelId }) => {
      socket.to(`channel:${channelId}`).emit("user:typing", {
        userId,
      });
    });

    socket.on("typing:stop", ({ channelId }) => {
      socket.to(`channel:${channelId}`).emit("user:stopTyping", {
        userId,
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);
    });
  });
};
