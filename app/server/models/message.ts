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
  },
  { timestamps: true },
);

export const Message = mongoose.model("Message", messageSchema);

