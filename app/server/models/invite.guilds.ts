import mongoose, { Schema, Types } from "mongoose";

const inviteSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    guild: {
      type: Types.ObjectId,
      ref: "Guild",
      required: true,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
    },
    maxUses: {
      type: Number,
    },
    uses: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Invite = mongoose.model("Invite", inviteSchema);