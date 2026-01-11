import { request } from "../lib/request";

export const chatService = {
  getMessages: (userId: string) => request.get(`/messages/${userId}`, {
    // Error is handled globally
  }),
  
  sendMessage: (conversationId: string, data: any) => request.post(`/messages/send/${conversationId}`, data, {
    // showError: true (default)
  })
};
