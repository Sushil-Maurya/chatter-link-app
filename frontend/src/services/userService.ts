import { request } from "../lib/request";

export const userService = {
  getAllUsers: () => request.get("/messages/users"),
  searchUsers: (query: string) => request.get(`/auth/search?query=${query}`),
  addContact: (data: { identifier?: string, id?: string, name?: string, email?: string, phone?: string }) => {
      if(data.id) return request.post(`/auth/add/${data.id}`);
      return request.post(`/auth/add`, data);
  },
  syncContacts: (contacts: any[]) => request.post("/auth/sync", { contacts }),
};
