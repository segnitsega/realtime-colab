import { Request, Response } from "express";
import {
  getChannelDetail,
  updateChannel,
  deleteChannel,
  markUserTypingInChannel,
  getChannelMessages,
  createChannelMessage,
  updateChannelMessage,
  deleteChannelMessage,
  createChannelInvite,
  listChannelInvites,
} from "../services/channels.service";

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

export const handleTypingController = async (req: Request, res: Response) => {
  const channelId = req.params.channelId as string;
  await markUserTypingInChannel(req.user!.id, channelId);

  res.status(200).json({
    success: true,
    message: "Typing status updated",
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

  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: { message },
  });
};

export const editMessageController = async (req: Request, res: Response) => {
  const channelId = req.params.channelId as string;
  const messageId = req.params.messageId as string;
  const message = await updateChannelMessage(
    req.user!.id,
    channelId,
    messageId,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Message updated successfully",
    data: { message },
  });
};

export const deleteMessageController = async (req: Request, res: Response) => {
  const channelId = req.params.channelId as string;
  const messageId = req.params.messageId as string;
  await deleteChannelMessage(req.user!.id, channelId, messageId);

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
