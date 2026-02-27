import { Request, Response } from "express";
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

export const createGuild = async (req: Request, res: Response) => {
  const guild = await createNewGuild(req.user!.id, req.body);
  res.status(201).json({
    success: true,
    message: "Guild created successfully",
    data: { guild },
  });
};

export const getGuilds = async (req: Request, res: Response) => {
  const guilds = await getGuildsUserIsIn(req.user!.id);
  res.status(200).json({
    success: true,
    data: { guilds },
  });
};

export const getGuild = async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const guild = await getGuildDetail(req.user!.id, guildId);
  res.status(200).json({
    success: true,
    data: { guild },
  });
};

export const updateGuild = async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const guild = await updateGuildSettings(req.user!.id, guildId, req.body);
  res.status(200).json({
    success: true,
    message: "Guild updated successfully",
    data: { guild },
  });
};

export const removeGuild = async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  await deleteGuild(req.user!.id, guildId);
  res.status(200).json({
    success: true,
    message: "Guild deleted successfully",
  });
};

export const getChannels = async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const channels = await getGuildChannels(req.user!.id, guildId);
  res.status(200).json({
    success: true,
    data: { channels },
  });
};

export const createChannel = async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const channels = await createGuildChannel(req.user!.id, guildId, req.body);
  res.status(201).json({
    success: true,
    message: "Channel created successfully",
    data: { channels },
  });
};

export const getMembers = async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const members = await listGuildMembers(req.user!.id, guildId);
  res.status(200).json({
    success: true,
    data: { members },
  });
};

export const joinGuildMember = async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const { inviteCode } = req.body;
  const guild = await joinGuild(req.user!.id, guildId, inviteCode);
  res.status(200).json({
    success: true,
    message: "Joined guild successfully",
    data: { guild },
  });
};

export const leaveGuildMember = async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  await leaveGuild(req.user!.id, guildId);
  res.status(200).json({
    success: true,
    message: "Left guild successfully",
  });
};

export const updateMember = async (req: Request, res: Response) => {
  const guildId = req.params.guildId as string;
  const userId = req.params.userId as string;
  const member = await updateGuildMember(
    req.user!.id,
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
  const guildId = req.params.guildId as string;
  const userId = req.params.userId as string;
  await kickGuildMember(req.user!.id, guildId, userId);
  res.status(200).json({
    success: true,
    message: "Member kicked successfully",
  });
};
