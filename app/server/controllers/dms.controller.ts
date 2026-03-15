import { Request, Response } from "express";
import {
  getOrCreateConversation,
  getConversations,
  getConversation,
  getConversationMessages,
  sendDMMessage,  
  updateDMMessage,
  deleteDMMessage,
} from "../services/dms.service";
import { emitConversationEvent } from "../realtime/dm.events";
import { serializeMessage } from "../utils/serializeMessage";

export const getOrCreateConversationController = async (req: Request, res: Response) => {
  const otherUserId = req.body.otherUserId as string;

  if (!otherUserId) {
    return res.status(400).json({
      success: false,
      message: "otherUserId is required",
    });
  }

  const conversation = await getOrCreateConversation(req.user!.id, otherUserId);
  res.status(200).json({
    success: true,
    data: conversation,
  });
};

export const getConversationsController = async (req: Request, res: Response) => {
  const list = await getConversations(req.user!.id);
  res.status(200).json({
    success: true,
    data: list,
  });
};

export const getConversationController = async (req: Request, res: Response) => {
  const conversationId = req.params.conversationId as string;
  const conversation = await getConversation(conversationId, req.user!.id);
  res.status(200).json({
    success: true,
    data: conversation,
  });
};

export const getConversationMessagesController = async (req: Request, res: Response) => {
  const conversationId = req.params.conversationId as string;
  const page = parseInt((req.query.page as string) ?? "1", 10) || 1;
  const limit = parseInt((req.query.limit as string) ?? "50", 10) || 50;
  
  const result = await getConversationMessages(req.user!.id, conversationId, {
    page,
    limit,
  });
  const serialized = {
    ...result,
    messages: result.messages.map((m: any) => serializeMessage(m)),
  };
  res.status(200).json({
    success: true,
    data: serialized,
  });
};

export const sendDMMessageController = async (req: Request, res: Response) => {
  const conversationId = req.params.conversationId as string;
  const message = await sendDMMessage(conversationId, req.user!.id, req.body);
  await message.populate("sender", "username avatar_url");
  const serializedMessage = serializeMessage(message);

  emitConversationEvent(conversationId, "dm:message:created", {
    conversationId,
    message: serializedMessage,
  });

  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: { message: serializedMessage },
  });
};

export const updateDMMessageController = async (req: Request, res: Response) => {
  const conversationId = req.params.conversationId as string;
  const messageId = req.params.messageId as string;
  const message = await updateDMMessage(conversationId, messageId, req.user!.id, req.body);
  await message.populate("sender", "username avatar_url");
  const serializedMessage = serializeMessage(message);

  emitConversationEvent(conversationId, "dm:message:updated", {
    conversationId,
    message: serializedMessage,
  });

  res.status(200).json({
    success: true,
    message: "Message updated successfully",
    data: { message: serializedMessage },
  });
};

export const deleteDMMessageController = async (req: Request, res: Response) => {
  const conversationId = req.params.conversationId as string;
  const messageId = req.params.messageId as string;
  await deleteDMMessage(conversationId, messageId, req.user!.id);

  emitConversationEvent(conversationId, "dm:message:deleted", {
    conversationId,
    messageId,
  });

  res.status(200).json({
    success: true,
    message: "Message deleted successfully",
  });
};
