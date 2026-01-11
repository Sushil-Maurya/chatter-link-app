import { create } from 'zustand';
import { userService } from '../services/userService';
import { toast } from '../hooks/use-toast';

interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profilePic?: string;
  gender?: string;
  contacts?: string[]; // IDs of their contacts
}

interface ContactStore {
  contacts: Contact[];
  registeredContacts: Contact[]; // From phone sync
  isLoading: boolean;
  
  // Actions
  syncPhoneContacts: (contacts: any[]) => Promise<void>;
  inviteUser: (emailOrPhone: string) => Promise<string | null>;
}

export const useContactStore = create<ContactStore>((set) => ({
  contacts: [],
  registeredContacts: [],
  isLoading: false,

  syncPhoneContacts: async (phoneContacts: any[]) => {
    set({ isLoading: true });
    try {
      const res = await userService.syncContacts(phoneContacts);
      // res.data.registeredUsers
      if (res && res.data && res.data.registeredUsers) {
          set({ registeredContacts: res.data.registeredUsers });
      } else if (res.registeredUsers) { // Handle different response structures
           set({ registeredContacts: res.registeredUsers });
      }
    } catch (error) {
      console.error("Sync failed", error);
      toast({ title: "Error", description: "Failed to sync contacts", variant: "destructive" });
    } finally {
      set({ isLoading: false });
    }
  },

  inviteUser: async () => {
      // return invite link or status
      // This is usually handled by addContact returning a specific status
      return null; 
  }
}));
