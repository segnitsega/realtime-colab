import { Server } from "socket.io";

let io: Server;
type ChannelEventType =
  | "message:created"
  | "message:updated"
  | "message:deleted"
  | "message:pinned"
  | "message:unpinned"
  | "reaction:added"
  | "reaction:removed"
  | "channel:update"
  | "user:joined";

export const setSocketInstance = (server: Server) => {
  io = server;
};

export const emitChannelEvent = (
  channelId: string,
  event: ChannelEventType,
  payload: any,
) => {
  if (!io) return;
  io.to(`channel:${channelId}`).emit(event, payload);
};
