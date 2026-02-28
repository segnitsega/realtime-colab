import express from "express";
import {
  createGuild,
  getGuilds,
  getGuild,
  updateGuild,
  removeGuild,
  getChannels,
  createChannel,
  getMembers,
  leaveGuildMember,
  updateMember,
  kickMember,
  joinInviteController,
  createInviteController,
} from "../controllers/guilds.controller";

export const guildsRouter = express.Router();

// Create a new guild
guildsRouter.post("/", createGuild);

// Get list of guilds the user is in
guildsRouter.get("/", getGuilds);

//Get guild details
guildsRouter.get("/:guildId", getGuild);

// Update guild settings
guildsRouter.patch("/:guildId", updateGuild);

// Delete guild (owner only)
guildsRouter.delete("/:guildId", removeGuild);

//  Get channels in a guild
guildsRouter.get("/:guildId/channels", getChannels);

// Create a new channel in guild
guildsRouter.post("/:guildId/channels", createChannel);

// List guild members
guildsRouter.get("/:guildId/members", getMembers);

// Create an invite link to a guild
guildsRouter.post("/:guildId/invite", createInviteController);

// join guild via invite link
guildsRouter.post("/invite/:code/join", joinInviteController);

// Leave guild
guildsRouter.delete("/:guildId/members/@me", leaveGuildMember);

// Update member roles/nick
guildsRouter.patch("/:guildId/members/:userId", updateMember);

// Kick member (moderator)
guildsRouter.delete("/:guildId/members/:userId", kickMember);
