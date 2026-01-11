import { request } from "../lib/request";

export const userService = {
  getAllUsers: () => request.get("/auth/users", {
     // Global error handling handles errors
  }),
};
