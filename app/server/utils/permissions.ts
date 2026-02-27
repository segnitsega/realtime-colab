import { AppError } from "./AppError";

export const ensureGuildMember = (guild: any, userId: string) => {
  const isMember =
    guild.owner.toString() === userId ||
    guild.members.some((m: any) => m.user.toString() === userId);

  if (!isMember && !guild.isPublic) {
    throw new AppError("You are not a member of this guild", 403);
  }
};

export const getMember = (guild: any, userId: string) => {
  return guild.members.find((m: any) => m.user.toString() === userId);
};

export const ensureRoleAtLeast = (
  guild: any,
  userId: string,
  roles: string[],
) => {
  if (guild.owner.toString() === userId && roles.includes("owner")) {
    return;
  }

  const member = getMember(guild, userId);
  if (!member || !roles.includes(member.role)) {
    throw new AppError("You do not have permission for this action", 403);
  }
};
