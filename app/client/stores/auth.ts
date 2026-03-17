import { create } from "zustand";
import type { User } from "../../../packages/types/user";

type AuthState = {
  user: User | null;
  setUser: (user: User | null) => void;
};

export const authStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
