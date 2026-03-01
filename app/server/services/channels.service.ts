import crypto from "crypto";
import { Types } from "mongoose";
import { Guild } from "../models/guilds";
import { Message } from "../models/message";
import { Invite } from "../models/invite.guilds";
import { AppError } from "../utils/AppError";
import { ensureGuildMember, ensureRoleAtLeast } from "../utils/permissions";

const findGuildByChannelOrThrow = async (channelId: string) => {
  const guild = await Guild.findOne({ "channels._id": new Types.ObjectId(channelId) });
  if (!guild) {
    throw new AppError("Channel not found", 404);
  }

  const channel: any = guild.channels.id(channelId);
  if (!channel) {
    throw new AppError("Channel not found", 404);
  }

  return { guild, channel };
};

export const getChannelDetail = async (userId: string, channelId: string) => {
  const { guild, channel } = await findGuildByChannelOrThrow(channelId);

  ensureGuildMember(guild, userId);

  return {
    guildId: guild._id,
    channel,
  };
};

export const updateChannel = async (
  userId: string,
  channelId: string,
  data: { name?: string; topic?: string; type?: "text" | "voice" },
) => {
  const { guild, channel } = await findGuildByChannelOrThrow(channelId);

  ensureRoleAtLeast(guild, userId, ["owner", "admin", "moderator"]);

  const { name, topic, type } = data;

  if (name !== undefined) channel.name = name;
  if (topic !== undefined) channel.topic = topic;
  if (type !== undefined) {
    channel.type = type === "voice" ? "voice" : "text";
  }

  await guild.save();

  return {
    guildId: guild._id,
    channel,
  };
};

export const deleteChannel = async (userId: string, channelId: string) => {
  const { guild } = await findGuildByChannelOrThrow(channelId);

  ensureRoleAtLeast(guild, userId, ["owner", "admin"]);

  const channelSubdoc: any = guild.channels.id(channelId);
  if (!channelSubdoc) {
    throw new AppError("Channel not found", 404);
  }

  channelSubdoc.deleteOne();
  await guild.save();

  return true;
};

export const markUserTypingInChannel = async (
  userId: string,
  channelId: string,
) => {
  const { guild } = await findGuildByChannelOrThrow(channelId);

  ensureGuildMember(guild, userId);

  // Placeholder for real-time typing indicator integration (e.g. websockets)
  return true;
};

export const getChannelMessages = async (
  userId: string,
  channelId: string,
  options: { page?: number; limit?: number },
) => {
  const { guild } = await findGuildByChannelOrThrow(channelId);

  ensureGuildMember(guild, userId);

  const page = options.page && options.page > 0 ? options.page : 1;
  const limit = options.limit && options.limit > 0 ? options.limit : 50;
  const skip = (page - 1) * limit;

  const [messages, total] = await Promise.all([
    Message.find({ channelId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "username avatar_url"),
    Message.countDocuments({ channelId }),
  ]);

  return {
    page,
    limit,
    total,
    messages: messages.map((msg: any) => ({
      id: msg._id,
      content: msg.content,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
      sender: msg.sender && {
        id: msg.sender._id,
        username: msg.sender.username,
        avatarUrl: msg.sender.avatar_url,
      },
    })),
  };
};

export const createChannelMessage = async (
  userId: string,
  channelId: string,
  data: { content: string },
) => {
  const { guild } = await findGuildByChannelOrThrow(channelId);

  ensureGuildMember(guild, userId);

  if (!data.content) {
    throw new AppError("Message content is required", 400);
  }

  const message = await Message.create({
    guild: guild._id,
    channelId,
    sender: userId,
    content: data.content,
  });

  return message;
};

export const updateChannelMessage = async (
  userId: string,
  channelId: string,
  messageId: string,
  data: { content?: string },
) => {
  const message = await Message.findOne({ _id: messageId, channelId });

  if (!message) {
    throw new AppError("Message not found", 404);
  }

  if (!data.content) {
    throw new AppError("Message content is required", 400);
  }

  if (message.sender.toString() !== userId) {
    const guild = await Guild.findById(message.guild);
    if (!guild) {
      throw new AppError("Guild not found", 404);
    }
    ensureRoleAtLeast(guild as any, userId, ["owner", "admin", "moderator"]);
  }

  message.content = data.content;
  await message.save();

  return message;
};

export const deleteChannelMessage = async (
  userId: string,
  channelId: string,
  messageId: string,
) => {
  const message = await Message.findOne({ _id: messageId, channelId });

  if (!message) {
    throw new AppError("Message not found", 404);
  }

  if (message.sender.toString() !== userId) {
    const guild = await Guild.findById(message.guild);
    if (!guild) {
      throw new AppError("Guild not found", 404);
    }
    ensureRoleAtLeast(guild as any, userId, ["owner", "admin", "moderator"]);
  }

  await message.deleteOne();

  return true;
};

export const createChannelInvite = async (
  userId: string,
  channelId: string,
  options?: { expiresInHours?: number; maxUses?: number },
) => {
  const { guild } = await findGuildByChannelOrThrow(channelId);

  ensureGuildMember(guild, userId);

  const code = crypto.randomBytes(6).toString("hex");

  const invite = await Invite.create({
    code,
    guild: guild._id,
    channelId,
    createdBy: userId,
    expiresAt: options?.expiresInHours
      ? new Date(Date.now() + options.expiresInHours * 60 * 60 * 1000)
      : undefined,
    maxUses: options?.maxUses,
  });

  return {
    code,
    url: `${process.env.CLIENT_URL}/invite/${code}`,
    expiresAt: invite.expiresAt,
    maxUses: invite.maxUses,
    uses: invite.uses,
  };
};

export const listChannelInvites = async (userId: string, channelId: string) => {
  const { guild } = await findGuildByChannelOrThrow(channelId);

  ensureGuildMember(guild, userId);

  const invites = await Invite.find({ channelId }).sort({ createdAt: -1 });

  return invites.map((invite: any) => ({
    code: invite.code,
    url: `${process.env.CLIENT_URL}/invite/${invite.code}`,
    expiresAt: invite.expiresAt,
    maxUses: invite.maxUses,
    uses: invite.uses,
    createdAt: invite.createdAt,
  }));
};

