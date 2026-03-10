import mongoose, { Schema, Types } from "mongoose";

const dmMessageSchema = new Schema(
  {
    conversation: {
      type: Types.ObjectId,
      ref: "Conversation",
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

dmMessageSchema.index({ conversation: 1, createdAt: -1 });

export const DMMessage = mongoose.model("DMMessage", dmMessageSchema);
