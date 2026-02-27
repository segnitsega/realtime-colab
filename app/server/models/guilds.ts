import mongoose, { Schema, Types } from "mongoose";

const guildSchema = new Schema(
  {
    name: { type: String, required: true },
    icon: { type: String },
    owner: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        user: {
          type: Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["owner", "admin", "moderator", "member"],
          default: "member",
        },
        nick: {
          type: String,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    channels: [
      {
        name: { type: String, required: true },
        type: {
          type: String,
          enum: ["text", "voice"],
          default: "text",
        },
        topic: { type: String },
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    inviteCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    description: { type: String },
  },
  { timestamps: true },
);

export const Guild = mongoose.model("Guild", guildSchema);
