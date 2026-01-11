import express from "express";
import { getAllUsers, getSelectedUserMessages, markMessagesAsRead, sendMessage,  } from "../controllers/messageController.js";
import { protectedRoute } from "../middleware/auth.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectedRoute, getAllUsers);
messageRouter.put("/mark/:id", protectedRoute, markMessagesAsRead);
messageRouter.post("/send/:id", protectedRoute, sendMessage);
messageRouter.get("/:id", protectedRoute, getSelectedUserMessages);  
export default messageRouter;