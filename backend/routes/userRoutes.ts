import express from "express";
import { checkAuth, deleteUser, getAllUsers, getUser, updateUser, login, signup, searchUsers, addContact, syncContacts } from "../controllers/userController.ts";
import { protectedRoute } from "../middleware/auth.ts";

const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/update-user", protectedRoute, updateUser);
userRouter.get("/check-auth", protectedRoute, checkAuth);
userRouter.delete("/user", protectedRoute, deleteUser);
userRouter.get("/users", protectedRoute, getAllUsers);
userRouter.get("/search", protectedRoute, searchUsers);
userRouter.post("/add/:id?", protectedRoute, addContact); // id is optional now
userRouter.post("/sync", protectedRoute, syncContacts);
userRouter.get("/user/:id", protectedRoute, getUser);

export default userRouter;