import mongoose, { Schema, Types } from "mongoose";

const messageSchema = new Schema(
  {
    guild: {
      type: Types.ObjectId,
      ref: "Guild",
      required: true,
    },
    channelId: {
      type: String,
      required: true,
    },
    sender: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    reactions: [
      {
        emoji: {
          type: String,
          required: true,
        },
        user: {
          type: Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    pinned: {
      type: Boolean,
      default: false,
    },
    pinnedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const Message = mongoose.model("Message", messageSchema);

