import { Guild } from "../models/guilds";
import { AppError } from "../utils/AppError";
import {
  ensureGuildMember,
  getMember,
  ensureRoleAtLeast,
} from "../utils/permissions";

// Create a new guild
export const createNewGuild = async (
  userId: string,
  data: { name: string; icon?: string; description?: string; isPublic?: boolean },
) => {

  const { name, icon, description, isPublic } = data;

  if (!name) {
    throw new AppError("Guild name is required", 400);
  }

  const guild = new Guild({
    name,
    icon,
    description,
    isPublic: !!isPublic,
    owner: userId,
    members: [
      {
        user: userId,
        role: "owner",
      },
    ],
  });

  return await guild.save();
};

// Get list of guilds the user is in
export const getGuildsUserIsIn = async (userId: string) => {

  const guilds = await Guild.find({
    $or: [{ owner: userId }, { "members.user": userId }],
  });

  return guilds;
};

// Get guild details
export const getGuildDetail = async(userId: string, guildId: string) => {
  const guild = await Guild.findById(guildId);

  if (!guild) {
    throw new AppError("Guild not found", 404);
  }

  ensureGuildMember(guild, userId);

  return guild;
};

// Update guild settings
export const updateGuildSettings = async(
  userId: string,
  guildId:string,
  data: { name?: string; icon?: string; description?: string; isPublic?: boolean },
) => {

  const guild = await Guild.findById(guildId);

  if (!guild) {
    throw new AppError("Guild not found", 404);
  }

  if (guild.owner.toString() !== userId) {
    throw new AppError("Only the guild owner can update settings", 403);
  }

  const { name, icon, description, isPublic } = data;

  if (name !== undefined) guild.name = name;
  if (icon !== undefined) guild.icon = icon;
  if (description !== undefined) guild.description = description;
  if (isPublic !== undefined) guild.isPublic = !!isPublic;

  await guild.save();

  return guild;
};

// Delete guild (owner only)
export const deleteGuild = async(userId: string, guildId:string) => {

  const guild = await Guild.findById(guildId);

  if (!guild) {
    throw new AppError("Guild not found", 404);
  }

  if (guild.owner.toString() !== userId) {
    throw new AppError("Only the guild owner can delete this guild", 403);
  }

  await guild.deleteOne();

  return true;
};

// Get channels in a guild
export const getGuildChannels = async(userId: string, guildId:string) => {

  const guild = await Guild.findById(guildId);

  if (!guild) {
    throw new AppError("Guild not found", 404);
  }

  ensureGuildMember(guild, userId);

  return guild.channels;
};

// Create a new channel in a guild
export const createGuildChannel = async (
  userId: string,
  guildId: string,
  data: { name: string; type?: string; topic?: string },
) => {
  const { name, type, topic } = data;

  if (!name) {
    throw new AppError("Channel name is required", 400);
  }

  const guild = await Guild.findById(guildId);

  if (!guild) {
    throw new AppError("Guild not found", 404);
  }

  ensureRoleAtLeast(guild, userId, ["owner", "admin", "moderator"]);

  guild.channels.push({
    name,
    type: type ?? "text",
    topic,
  });

  await guild.save();

  return guild.channels;
};

// List guild members
export const listGuildMembers = async (userId: string, guildId: string) => {
  const guild = await Guild.findById(guildId).populate(
    "members.user",
    "username email avatar_url",
  );

  if (!guild) {
    throw new AppError("Guild not found", 404);
  }

  ensureGuildMember(guild, userId);

  return guild.members;
};

// Join guild (via invite)
export const joinGuild = async (
  userId: string,
  guildId: string,
  inviteCode?: string,
) => {
  const guild = await Guild.findById(guildId);

  if (!guild) {
    throw new AppError("Guild not found", 404);
  }

  const alreadyMember =
    guild.owner.toString() === userId ||
    guild.members.some((m: any) => m.user.toString() === userId);

  if (alreadyMember) {
    throw new AppError("You are already a member of this guild", 400);
  }

  if (!guild.isPublic) {
    if (!inviteCode || inviteCode !== guild.inviteCode) {
      throw new AppError("Invalid or missing invite code", 403);
    }
  }

  guild.members.push({
    user: userId,
    role: "member",
  });

  await guild.save();

  return guild;
};

// Leave guild
export const leaveGuild = async (userId: string, guildId: string) => {
  const guild = await Guild.findById(guildId);

  if (!guild) {
    throw new AppError("Guild not found", 404);
  }

  if (guild.owner.toString() === userId) {
    throw new AppError("Guild owner cannot leave their own guild", 400);
  }

  const beforeCount = guild.members.length;
  guild.members = guild.members.filter(
    (m: any) => m.user.toString() !== userId,
  ) as any;

  if (guild.members.length === beforeCount) {
    throw new AppError("You are not a member of this guild", 400);
  }

  await guild.save();

  return true;
};

// Update member roles/nick
export const updateGuildMember = async (
  currentUserId: string,
  guildId: string,
  userId: string,
  data: { role?: string; nick?: string },
) => {
  const { role, nick } = data;

  const guild = await Guild.findById(guildId);

  if (!guild) {
    throw new AppError("Guild not found", 404);
  }

  ensureRoleAtLeast(guild, currentUserId, ["owner", "admin", "moderator"]);

  const member = getMember(guild, userId as string);

  if (!member) {
    throw new AppError("Member not found", 404);
  }

  if (role !== undefined) {
    const allowedRoles = ["owner", "admin", "moderator", "member"];
    const roleValue = role as string;

    if (!allowedRoles.includes(roleValue)) {
      throw new AppError("Invalid role", 400);
    }

    if (roleValue === "owner" && guild.owner.toString() !== currentUserId) {
      throw new AppError(
        "Only the current owner can transfer ownership",
        403,
      );
    }

    member.role = roleValue;

    if (roleValue === "owner") {
      guild.owner = member.user;
    }
  }

  if (nick !== undefined) {
    member.nick = nick;
  }

  await guild.save();

  return member;
};

// Kick member (moderator)
export const kickGuildMember = async (
  currentUserId: string,
  guildId: string,
  userId: string,
) => {
  const guild = await Guild.findById(guildId);

  if (!guild) {
    throw new AppError("Guild not found", 404);
  }

  ensureRoleAtLeast(guild, currentUserId, ["owner", "admin", "moderator"]);

  if (guild.owner.toString() === userId) {
    throw new AppError("You cannot kick the guild owner", 400);
  }

  const beforeCount = guild.members.length;
  guild.members = guild.members.filter(
    (m: any) => m.user.toString() !== userId,
  ) as any;

  if (guild.members.length === beforeCount) {
    throw new AppError("Member not found", 404);
  }

  await guild.save();

  return true;
};
