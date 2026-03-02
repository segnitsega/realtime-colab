import { Request, Response } from "express";
import {
  getChannelDetail,
  updateChannel,
  deleteChannel,
  getChannelMessages,
  createChannelMessage,
  updateChannelMessage,
  deleteChannelMessage,
  createChannelInvite,
  listChannelInvites,
  addReactionToMessage,
  removeReactionFromMessage,
  pinMessage,
  unpinMessage,
  getPinnedMessages,
} from "../services/channels.service";
import { emitChannelEvent } from "../realtime/channel.events";
import { serializeMessage } from "../utils/serializeMessage";


export const getChannelController = async (req: Request, res: Response) => {
  const channelId = req.params.channelId as string;
  const result = await getChannelDetail(req.user!.id, channelId);

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const updateChannelController = async (req: Request, res: Response) => {
  const channelId = req.params.channelId as string;
  const updated = await updateChannel(req.user!.id, channelId, req.body);

  res.status(200).json({
    success: true,
    message: "Channel updated successfully",
    data: updated,
  });
};

export const deleteChannelController = async (req: Request, res: Response) => {
  const channelId = req.params.channelId as string;
  await deleteChannel(req.user!.id, channelId);

  res.status(200).json({
    success: true,
    message: "Channel deleted successfully",
  });
};

export const getChatHistoryController = async (req: Request, res: Response) => {
  const channelId = req.params.channelId as string;
  const page = parseInt((req.query.page as string) ?? "1", 10) || 1;
  const limit = parseInt((req.query.limit as string) ?? "50", 10) || 50;

  const history = await getChannelMessages(req.user!.id, channelId, {
    page,
    limit,
  });

  res.status(200).json({
    success: true,
    data: history,
  });
};

export const sendMessageController = async (req: Request, res: Response) => {
  const channelId = req.params.channelId as string;
  const message = await createChannelMessage(req.user!.id, channelId, req.body);

  await message.populate("sender", "username avatar_url");
  const serializedMessage = serializeMessage(message);

  emitChannelEvent(channelId, "message:created", {
    channelId,
    message: serializedMessage
  });

  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: { serializedMessage },
  });
};

export const editMessageController = async (req: Request, res: Response) => {
  const channelId = req.params.channelId as string;
  const messageId = req.params.messageId as string;
  const message: any = await updateChannelMessage(
    req.user!.id,
    channelId,
    messageId,
    req.body,
  );

  await message.populate("sender", "username avatar_url");
  const serializedMessage = serializeMessage(message);


  emitChannelEvent(message.channelId, "message:updated", {
    channelId: message.channelId,
    message: serializedMessage,
  });

  res.status(200).json({
    success: true,
    message: "Message updated successfully",
    data: { serializedMessage },
  });
};

export const deleteMessageController = async (req: Request, res: Response) => {
  const channelId = req.params.channelId as string;
  const messageId = req.params.messageId as string;
  await deleteChannelMessage(req.user!.id, channelId, messageId);
  
  emitChannelEvent(channelId, "message:deleted", {
    // channelId: channelId,
    messageId: messageId,
  });

  res.status(200).json({
    success: true,
    message: "Message deleted successfully",
  });
};

export const createInviteController = async (req: Request, res: Response) => {
  const channelId = req.params.channelId as string;
  const invite = await createChannelInvite(req.user!.id, channelId, req.body);

  res.status(201).json({
    success: true,
    message: "Invite created successfully",
    data: { invite },
  });
};

export const getInvitesController = async (req: Request, res: Response) => {
  const channelId = req.params.channelId as string;
  const invites = await listChannelInvites(req.user!.id, channelId);

  res.status(200).json({
    success: true,
    data: { length: invites.length, invites },
  });
};

export const addReactionController = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const channelId = req.params.channelId as string;
  const messageId = req.params.messageId as string;
  const message = await addReactionToMessage(
    req.user!.id,
    channelId,
    messageId,
    req.body,
  );

  await message.populate("sender", "username avatar_url");
  const serializedMessage = serializeMessage(message);

  emitChannelEvent(channelId, "reaction:added", {
    channelId,
    message: serializedMessage,
    emoji: req.body.emoji,
    userId,
  });

  res.status(200).json({
    success: true,
    message: "Reaction added successfully",
    data: { message },
  });
};

export const removeReactionController = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const channelId = req.params.channelId as string;
  const messageId = req.params.messageId as string;
  const emoji = req.params.emoji as string;
  const message = await removeReactionFromMessage(
    req.user!.id,
    channelId,
    messageId,
    emoji,
  );

  await message.populate("sender", "username avatar_url");
  const serializedMessage = serializeMessage(message);

  emitChannelEvent(channelId, "reaction:removed", {
    channelId,
    message: serializedMessage,
    emoji,
    userId,
  });

  res.status(200).json({
    success: true,
    message: "Reaction removed successfully",
    data: { message },
  });
};

export const pinMessageController = async (req: Request, res: Response) => {
  const channelId = req.params.channelId as string;
  const messageId = req.params.messageId as string;
  const message = await pinMessage(req.user!.id, channelId, messageId);

  await message.populate("sender", "username avatar_url");
  const serializedMessage = serializeMessage(message);

  emitChannelEvent(channelId, "message:pinned", {
    channelId,
    message: serializedMessage,
  });

  res.status(200).json({
    success: true,
    message: "Message pinned successfully",
    data: { message },
  });
};

export const unpinMessageController = async (req: Request, res: Response) => {
  const channelId = req.params.channelId as string;
  const messageId = req.params.messageId as string;
  const message = await unpinMessage(req.user!.id, channelId, messageId);

  await message.populate("sender", "username avatar_url");
  const serializedMessage = serializeMessage(message);

  emitChannelEvent(channelId, "message:unpinned", {
    channelId,
    message: serializedMessage,
  });

  res.status(200).json({
    success: true,
    message: "Message unpinned successfully",
    data: { message },
  });
};

export const getPinnedMessagesController = async (
  req: Request,
  res: Response,
) => {
  const channelId = req.params.channelId as string;
  const messages = await getPinnedMessages(req.user!.id, channelId);

  res.status(200).json({
    success: true,
    data: { length: messages.length, messages },
  });
};
