import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    passwordHash: { type: String },
    avatar_url: { type: String },
    bio: { type: String },
    online: { type: Boolean, default: false },
    last_active: { type: Date, default: Date.now },
    status: { type: String, default: "offline" },
    role: { type: String, default: "user" },
    refreshToken: { type: String },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
