import crypto from "crypto";
import { Invite } from "../models/invite.guilds";
import { Guild } from "../models/guilds";
import { AppError } from "../utils/AppError";

export const createInvite = async (
  userId: string,
  guildId: string,
  options?: { expiresInHours?: number; maxUses?: number }
) => {
  const guild = await Guild.findById(guildId);
  if (!guild) throw new AppError("Guild not found", 404);

  const code = crypto.randomBytes(6).toString("hex");

  const invite = await Invite.create({
    code,
    guild: guildId,
    createdBy: userId,
    expiresAt: options?.expiresInHours
      ? new Date(Date.now() + options.expiresInHours * 60 * 60 * 1000)
      : undefined,
    maxUses: options?.maxUses,
  });

  return {
    code,
    url: `${process.env.CLIENT_URL}/invite/${code}`,
  };
};

export const joinViaInvite = async (
    userId: string,
    code: string
  ) => {
    const invite = await Invite.findOne({ code }).populate("guild");
    if (!invite) throw new AppError("Invalid invite", 404);
  
    if (invite.expiresAt && invite.expiresAt < new Date()) {
      throw new AppError("Invite expired", 400);
    }
  
    if (invite.maxUses && invite.uses >= invite.maxUses) {
      throw new AppError("Invite usage limit reached", 400);
    }
  
    const guild = invite.guild as any;
  
    const alreadyMember =
      guild.owner.toString() === userId ||
      guild.members.some((m: any) => m.user.toString() === userId);
  
    if (alreadyMember) {
      throw new AppError("Already a member", 400);
    }
  
    guild.members.push({ user: userId, role: "member" });
    await guild.save();
  
    invite.uses += 1;
    await invite.save();
  
    return guild;
  };