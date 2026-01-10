import { create } from 'zustand';
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
  messages: Record<string, Message[]>; // conversationId -> messages[]
  setMessages: (conversationId: string, messages: Message[]) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessageStatus: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  
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
  addConversation: (conversation) => 
    set((state) => ({
      conversations: [...state.conversations, conversation]
    })),
  updateConversation: (conversationId, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv._id === conversationId ? { ...conv, ...updates } : conv
      ),
    })),
  
  // Messages
  messages: {},
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: messages,
      },
    })),
  addMessage: (conversationId, message) =>
    set((state) => {
      const currentMessages = state.messages[conversationId] || [];
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...currentMessages, message],
        },
      };
    }),
  updateMessageStatus: (conversationId, messageId, updates) =>
    set((state) => {
      const conversationMessages = state.messages[conversationId];
      if (!conversationMessages) return state;
      
      return {
        messages: {
          ...state.messages,
          [conversationId]: conversationMessages.map((msg) =>
            msg._id === messageId ? { ...msg, ...updates } : msg
          ),
        },
      };
    }),
  
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
      messages: {},
      typingUsers: {},
    }),
}));
