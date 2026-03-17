export interface User {
  _id: string;
  email: string;
  username: string;
  displayName?: string;
  passwordHash?: string;
  avatarUrl?: string;
  bio?: string;
  role?: string;
  online: boolean;
  last_active: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
