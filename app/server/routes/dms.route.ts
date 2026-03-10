import express from "express";
import {
  getOrCreateConversationController,
  getConversationsController,
  getConversationController,
  getConversationMessagesController,
  sendDMMessageController,
  updateDMMessageController,
  deleteDMMessageController,
} from "../controllers/dms.controller";

export const dmsRouter = express.Router();

// List my DM conversations
dmsRouter.get("/conversations", getConversationsController);

// Get or create 1:1 conversation (body: { otherUserId })
dmsRouter.post("/conversations", getOrCreateConversationController);

// Get one conversation
dmsRouter.get("/conversations/:conversationId", getConversationController);

// Get messages in a conversation (query: page, limit)
dmsRouter.get("/conversations/:conversationId/messages", getConversationMessagesController);

// Send message (body: { content })
dmsRouter.post("/conversations/:conversationId/messages", sendDMMessageController);

// Edit message (body: { content })
dmsRouter.put(
  "/conversations/:conversationId/messages/:messageId",
  updateDMMessageController,
);

// Delete message
dmsRouter.delete(
  "/conversations/:conversationId/messages/:messageId",
  deleteDMMessageController,
);
