import { create } from "zustand";
import { authService } from "../services/authService";
import { toast } from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";

interface User {
  _id: string;
  name: string;
  email: string;
  profilePic: string;
  bio: string;
}

interface AuthStore {
  authUser: User | null;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isUpdatingProfile: boolean;
  isCheckingAuth: boolean;
  onlineUsers: string[];
  socket: any;

  checkAuth: () => Promise<void>;
  signup: (data: any) => Promise<boolean>;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;

  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const res = await authService.checkAuth();
      set({ authUser: res.result.user });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      await authService.signup(data);
      // Success handled by global toast
      return true;
    } catch (error: any) {
      // Error handled by global toast
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await authService.login(data);
      localStorage.setItem("token", res.result.token);
      set({ authUser: res.result.user });
      // Success handled by global toast
      get().connectSocket();
    } catch (error: any) {
      // Error handled by global toast
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      localStorage.removeItem("token");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error: any) {
      toast.error("Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await authService.updateProfile(data);
      set({ authUser: res.result.user });
      // Success handled by global toast
    } catch (error: any) {
      console.log("error in update profile:", error);
      // Error handled by global toast
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });
    
    // Also listen for "onlineUsers" event as server might emit that
    socket.on("onlineUsers", (userIds: string[]) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
    set({ socket: null });
  },
}));
