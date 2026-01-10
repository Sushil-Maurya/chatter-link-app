export interface User {
  _id: string;
  name: string;
  email: string;
  profilePic?: string;
  bio?: string;
  online?: boolean;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: string; // User ID
  content: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  _id: string;
  participants: string[]; // Array of user IDs
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}
