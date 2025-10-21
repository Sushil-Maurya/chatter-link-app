import express from "express";
import { getAllUsers, getSelectedUserMessages, markMessagesAsRead, sendMessage,  } from "../controllers/messageController.ts";
import { protectedRoute } from "../middleware/auth.ts";

const messageRouter = express.Router();

messageRouter.get("/get-selected-user-messages/:id", protectedRoute, getSelectedUserMessages);
messageRouter.get("/users",protectedRoute, getAllUsers);
messageRouter.put("/mark/:id", protectedRoute, markMessagesAsRead);
messageRouter.post("/send/:id",protectedRoute, sendMessage);  
export default messageRouter;