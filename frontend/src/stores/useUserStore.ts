import { create } from 'zustand';
import { userService } from '../services/userService';
// toast is handled globally by request layer
import { User } from '../types';

interface UserState {
  // All users in the system (for search/contacts)
  users: User[];
  pendingInvites: any[];
  unreadCounts: Record<string, number>;
  lastMessages: Record<string, any>;
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
  getFilteredUsers: () => any[];
  searchGlobalUsers: (query: string) => Promise<User[]>;
  addContact: (data: { userId?: string, name?: string, email?: string, phone?: string }) => Promise<any>;
  
  // Reset store
  reset: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  // All users
  users: [],
  pendingInvites: [],
  unreadCounts: {},
  lastMessages: {},
  isLoading: false,
  setUsers: (users) => set({ users }),
  getUsers: async () => {
    // Avoid redundant calls if already loading or if we already have users
    if (get().isLoading) return;
    
    set({ isLoading: true });
    try {
      const res = await userService.getAllUsers();
      // Backend returns { success, result: { users, pendingInvites } }
      if (res?.result) {
        set({ 
          users: res.result.users || [],
          pendingInvites: res.result.pendingInvites || [],
          unreadCounts: res.result.unsendMessages || {},
          lastMessages: res.result.lastMessages || {}
        });
      } else if (res?.users) {
        // Fallback for legacy response
        set({ users: res.users, pendingInvites: [], unreadCounts: {}, lastMessages: {} });
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
    const { users, pendingInvites, searchQuery, onlineUsers } = get();
    
    // Map registered users with online status
    const mappedUsers = users.map(user => ({
      ...user,
      online: onlineUsers.has(user._id),
      isInvite: false
    }));

    // Map pending invites
    const mappedInvites = pendingInvites.map(invite => ({
      _id: invite._id,
      name: invite.targetName || "Unknown",
      email: invite.targetEmail,
      phone: invite.targetPhone,
      inviteUrl: invite.inviteUrl,
      isInvite: true
    }));

    const allContacts = [...mappedUsers, ...mappedInvites];

    if (!searchQuery.trim()) {
      return allContacts;
    }
    
    const query = searchQuery.toLowerCase();
    return allContacts.filter(
      (contact: any) =>
        contact.name.toLowerCase().includes(query) ||
        (contact.email && contact.email.toLowerCase().includes(query)) ||
        (contact.phone && contact.phone.toLowerCase().includes(query))
    );
  },
  
  // Reset store
  reset: () =>
    set({
      users: [],
      pendingInvites: [],
      unreadCounts: {},
      lastMessages: {},
      onlineUsers: new Set(),
      searchQuery: '',
    }),

  // Add Contact
  addContact: async (data: { userId?: string, name?: string, email?: string, phone?: string }) => {
      try {
          const res = await userService.addContact({ 
            id: data.userId,
            name: data.name,
            email: data.email,
            phone: data.phone
          });
          // Refresh users list to include new contact or pending invite
          await get().getUsers(); 
          return res;
      } catch (error) {
          console.error("Failed to add contact", error);
          throw error;
      }
  },

  // Search Users (Global)
  searchGlobalUsers: async (query: string) => {
      try {
          if(!query) return [];
          const res = await userService.searchUsers(query);
          return res.result?.users || res.users || []; // adjust based on API response
      } catch (error) {
          console.error("Failed to search users", error);
          return [];
      }
  }
}));
