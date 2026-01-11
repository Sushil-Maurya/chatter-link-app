import { create } from 'zustand';
import { chatService } from "../services/chatService";
import { useAuthStore } from "./useAuthStore";
import { Message, Conversation } from '../types';

interface ChatState {
  // Active conversation
  activeConversationId: string | null;
  setActiveConversation: (conversationId: string | null) => void;
  
  // Conversations
  conversations: Conversation[];
  setConversations: (conversations: Conversation[]) => void;
  addConversation: (conversation: Conversation) => void;
  updateConversation: (conversationId: string, updates: Partial<Conversation>) => void;
  
  // Messages
  messages: Message[];
  isMessagesLoading: boolean;
  getMessages: (userId: string) => Promise<void>;
  sendMessage: (messageData: any) => Promise<void>;

  subscribeToMessages: () => void;
  unsubscribeFromMessages: () => void;
  
  // Typing indicators
  typingUsers: Record<string, Set<string>>; // conversationId -> Set of user IDs who are typing
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
  
  // Reset store
  reset: () => void;
}


export const useChatStore = create<ChatState>((set, get) => ({
  // Active conversation
  activeConversationId: null,
  setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),
  
  // Conversations
  conversations: [],
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation: Conversation) => 
    set((state) => ({
      conversations: [...state.conversations, conversation]
    })),
  updateConversation: (conversationId: string, updates: Partial<Conversation>) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv._id === conversationId ? { ...conv, ...updates } : conv
      ),
    })),
  
  // Messages
  messages: [],
  isMessagesLoading: false,
  getMessages: async (userId: string) => {
    // Avoid double loading the same or different users simultaneously
    if (get().isMessagesLoading) return;

    set({ isMessagesLoading: true });
    try {
      const res = await chatService.getMessages(userId);
      set({ messages: res.result.messages });
    } catch (error: any) {
      // Error handled globally
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData: any) => {
    const { activeConversationId, messages } = get();
    try {
      const res = await chatService.sendMessage(activeConversationId!, messageData); 
      set({ messages: [...messages, res.result.message] }); 
    } catch (error: any) {
        // Error handled globally
    }
  },
  
  subscribeToMessages: () => {
    const { activeConversationId } = get();
    if (!activeConversationId) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage: Message) => {
      const isMessageSentFromSelectedUser = newMessage.sender === activeConversationId;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });

    socket.on("typing", ({ senderId }: { senderId: string }) => {
       const { activeConversationId } = get();
       if (!activeConversationId) return;

       if (senderId === activeConversationId) {
          set((state) => {
            const currentTyping = new Set(state.typingUsers[activeConversationId] || []);
            currentTyping.add(senderId);
            return {
              typingUsers: {
                ...state.typingUsers,
                [activeConversationId]: currentTyping,
              }
            };
          });
       }
    });

    socket.on("stopTyping", ({ senderId }: { senderId: string }) => {
       const { activeConversationId } = get();
       if (!activeConversationId) return;

       if (senderId === activeConversationId) {
          set((state) => {
            const currentTyping = new Set(state.typingUsers[activeConversationId] || []);
            currentTyping.delete(senderId);
            return {
              typingUsers: {
                ...state.typingUsers,
                [activeConversationId]: currentTyping,
              }
            };
          });
       }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
    socket.off("typing");
    socket.off("stopTyping");
  },

  // Typing indicators
  typingUsers: {},
  setTyping: (conversationId, userId, isTyping) =>
    set((state) => {
      const currentTyping = new Set(state.typingUsers[conversationId] || []);
      
      if (isTyping) {
        currentTyping.add(userId);
      } else {
        currentTyping.delete(userId);
      }
      
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: currentTyping,
        },
      };
    }),
  
  // Reset store
  reset: () =>
    set({
      activeConversationId: null,
      conversations: [],
      messages: [],
      typingUsers: {},
    }),
}));
