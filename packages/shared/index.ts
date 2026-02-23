export interface User {
  _id: string; 
  email: string;
  username: string;
  passwordHash?: string; // Optional for OAuth later!
  avatarUrl?: string;
  bio?: string; 
  online: boolean;
  last_active: Date;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
// Add your Server, Message, and WebSocket interfaces here too