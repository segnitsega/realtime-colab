import mongoose, { Schema, Types } from "mongoose";

const conversationSchema = new Schema(
  {
    participants: [
      {
        type: Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    type: {
      type: String,
      enum: ["dm", "group"], // I can add groups later. 
      default: "dm",
    },
  },
  { timestamps: true },
);

conversationSchema.index(
  { participants: 1, type: 1 },
  { unique: true },
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
