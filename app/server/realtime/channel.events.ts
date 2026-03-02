import { Server } from "socket.io";

let io: Server;
type ChannelEventType = "message:new" | "channel:update" | "user:joined";

export const setSocketInstance = (server: Server) => {
  io = server;
};

export const emitChannelEvent = (
  channelId: string,
  event: string,
  payload: any,
) => {
  if (!io) return;
  io.to(`channel:${channelId}`).emit(event, payload);
};
