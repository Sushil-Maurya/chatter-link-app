import { request } from "../lib/request";

export const authService = {
  checkAuth: () => request.get("/auth/check-auth"),
  
  signup: (data: any) => request.post("/auth/signup", data, {
    showSuccess: "Account created successfully",
    showError: true
  }),
  
  login: (data: any) => request.post("/auth/login", data, {
    showSuccess: "Logged in successfully",
    showError: true
  }),
  
  updateProfile: (data: any) => request.put("/auth/update-user", data, {
    showSuccess: "Profile updated successfully",
    showError: true
  })
};
