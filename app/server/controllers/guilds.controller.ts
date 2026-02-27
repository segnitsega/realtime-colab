import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import {
  createNewGuild,
  getGuildsUserIsIn,
  getGuildDetail,
  updateGuildSettings,
  deleteGuild,
  getGuildChannels,
  createGuildChannel,
  listGuildMembers,
  joinGuild,
  leaveGuild,
  updateGuildMember,
  kickGuildMember,
} from "../services/guilds.service";

const ensureAuth = (req: Request): string => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }
  return userId;
};

export const createGuild = async (req: Request, res: Response) => {
  const userId = ensureAuth(req);
  const guild = await createNewGuild(userId, req.body);
  res.status(201).json({
    success: true,
    message: "Guild created successfully",
    data: { guild },
  });
};

export const getGuilds = async (req: Request, res: Response) => {
  const userId = ensureAuth(req);
  const guilds = await getGuildsUserIsIn(userId);
  res.status(200).json({
    success: true,
    data: { guilds },
  });
};

export const getGuild = async (req: Request, res: Response) => {
  const userId = ensureAuth(req);
  const guildId = req.params.guildId as string;
  const guild = await getGuildDetail(userId, guildId);
  res.status(200).json({
    success: true,
    data: { guild },
  });
};

export const updateGuild = async (req: Request, res: Response) => {
  const userId = ensureAuth(req);
  const guildId = req.params.guildId as string;
  const guild = await updateGuildSettings(userId, guildId, req.body);
  res.status(200).json({
    success: true,
    message: "Guild updated successfully",
    data: { guild },
  });
};

export const removeGuild = async (req: Request, res: Response) => {
  const userId = ensureAuth(req);
  const guildId = req.params.guildId as string;
  await deleteGuild(userId, guildId);
  res.status(200).json({
    success: true,
    message: "Guild deleted successfully",
  });
};

export const getChannels = async (req: Request, res: Response) => {
  const userId = ensureAuth(req);
  const guildId = req.params.guildId as string;
  const channels = await getGuildChannels(userId, guildId);
  res.status(200).json({
    success: true,
    data: { channels },
  });
};

export const createChannel = async (req: Request, res: Response) => {
  const userId = ensureAuth(req);
  const guildId = req.params.guildId as string;
  const channels = await createGuildChannel(userId, guildId, req.body);
  res.status(201).json({
    success: true,
    message: "Channel created successfully",
    data: { channels },
  });
};

export const getMembers = async (req: Request, res: Response) => {
  const userId = ensureAuth(req);
  const guildId = req.params.guildId as string;
  const members = await listGuildMembers(userId, guildId);
  res.status(200).json({
    success: true,
    data: { members },
  });
};

export const joinGuildMember = async (req: Request, res: Response) => {
  const userId = ensureAuth(req);
  const guildId = req.params.guildId as string;
  const { inviteCode } = req.body;
  const guild = await joinGuild(userId, guildId, inviteCode);
  res.status(200).json({
    success: true,
    message: "Joined guild successfully",
    data: { guild },
  });
};

export const leaveGuildMember = async (req: Request, res: Response) => {
  const userId = ensureAuth(req);
  const guildId = req.params.guildId as string;
  await leaveGuild(userId, guildId);
  res.status(200).json({
    success: true,
    message: "Left guild successfully",
  });
};

export const updateMember = async (req: Request, res: Response) => {
  const currentUserId = ensureAuth(req);
  const guildId = req.params.guildId as string;
  const userId = req.params.userId as string;
  const member = await updateGuildMember(
    currentUserId,
    guildId,
    userId,
    req.body,
  );
  res.status(200).json({
    success: true,
    message: "Member updated successfully",
    data: { member },
  });
};

export const kickMember = async (req: Request, res: Response) => {
  const currentUserId = ensureAuth(req);
  const guildId = req.params.guildId as string;
  const userId = req.params.userId as string;
  await kickGuildMember(currentUserId, guildId, userId);
  res.status(200).json({
    success: true,
    message: "Member kicked successfully",
  });
};
