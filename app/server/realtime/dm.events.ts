import { Server } from "socket.io";

let io: Server;

export type DMEventType =
  | "dm:message:created"
  | "dm:message:updated"
  | "dm:message:deleted"
  | "dm:typing:start"
  | "dm:typing:stop";

export const setDMSocketInstance = (server: Server) => {
  io = server;
};

export const getDMIO = () => io;

export const emitConversationEvent = (
  conversationId: string,
  event: DMEventType,
  payload: Record<string, unknown>,
) => {
  if (!io) return;
  io.to(`dm:${conversationId}`).emit(event, payload);
};
