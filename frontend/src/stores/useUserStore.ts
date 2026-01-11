import { create } from 'zustand';
import { userService } from '../services/userService';
// toast is handled globally by request layer
import { User } from '../types';

interface UserState {
  // All users in the system (for search/contacts)
  users: User[];
  isLoading: boolean;
  setUsers: (users: User[]) => void;
  getUsers: () => Promise<void>;
  updateUserStatus: (userId: string, online: boolean) => void;
  
  // Online users tracking
  onlineUsers: Set<string>; // Set of user IDs who are online
  setUserOnline: (userId: string, isOnline: boolean) => void;
  setOnlineUsers: (userIds: string[]) => void;
  
  // Search functionality
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  getFilteredUsers: () => User[];
  
  // Reset store
  reset: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  // All users
  users: [],
  isLoading: false,
  setUsers: (users) => set({ users }),
  getUsers: async () => {
    set({ isLoading: true });
    try {
      const res = await userService.getAllUsers();
      // Backend returns { success, result: { users } }
      if (res?.result?.users) {
        set({ users: res.result.users });
      } else if (res?.users) {
        // Fallback for legacy response if API didn't change correctly
        set({ users: res.users });
      }
    } catch (error: any) {
       // Error handled globally
    } finally {
      set({ isLoading: false });
    }
  },
  updateUserStatus: (userId, online) =>
    set((state) => ({
      users: state.users.map((user) =>
        user._id === userId ? { ...user, online, lastSeen: new Date() } : user
      ),
    })),
  
  // Online users
  onlineUsers: new Set(),
  setUserOnline: (userId, isOnline) =>
    set((state) => {
      const onlineUsers = new Set(state.onlineUsers);
      
      if (isOnline) {
        onlineUsers.add(userId);
      } else {
        onlineUsers.delete(userId);
      }
      
      return { onlineUsers };
    }),
  setOnlineUsers: (userIds) => set({ onlineUsers: new Set(userIds) }),
  
  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  getFilteredUsers: () => {
    const { users, searchQuery, onlineUsers } = get();
    
    if (!searchQuery.trim()) {
      return users.map(user => ({
        ...user,
        online: onlineUsers.has(user._id)
      }));
    }
    
    const query = searchQuery.toLowerCase();
    return users
      .filter(
        (user) =>
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      )
      .map(user => ({
        ...user,
        online: onlineUsers.has(user._id)
      }));
  },
  
  // Reset store
  reset: () =>
    set({
      users: [],
      onlineUsers: new Set(),
      searchQuery: '',
    }),
}));
