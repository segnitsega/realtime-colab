import express from "express";
import {
  deleteChannelController,
  getChannelController,
  updateChannelController,
  handleTypingController,
  getChatHistoryController,
  sendMessageController,
  editMessageController,
  deleteMessageController,
  createInviteController,
  getInvitesController,
} from "../controllers/channels.controller";

export const channelRouter = express.Router();

channelRouter.get("/:channelId", getChannelController);

channelRouter.patch("/:channelId", updateChannelController);

channelRouter.delete("/:channelId", deleteChannelController);

channelRouter.post("/:channelId/typing", handleTypingController);

// get message history (with pagination)
channelRouter.get("/:channelId/messages", getChatHistoryController);

channelRouter.post("/:channelId/messages", sendMessageController);

// Edit a message
channelRouter.put("/:channelId/messages/:messageId", editMessageController);

channelRouter.delete(
  "/:channelId/messages/:messageId",
  deleteMessageController,
);

channelRouter.post("/:channelId/invites", createInviteController);

channelRouter.get("/:channelId/invites", getInvitesController);
