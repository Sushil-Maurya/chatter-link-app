export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profilePic?: string;
  gender: "male" | "female";
  bio?: string;
  online?: boolean;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: string;
  sender: string; // User ID
  receiver: string; // User ID
  text: string;
  image?: string;
  video?: string;
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
