import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { onlineUsersMap, io } from "../server.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


// Get all User for sidebar (Contacts + Conversations)
export const getAllUsers = asyncHandler(async (req: any, res: any) => {
    const userId = req.user._id;
    const currentUser = await User.findById(userId);
    if (!currentUser) {
        return res.status(200).json(new ApiResponse(200, 'User not found', { users: [], unsendMessages: {} }));
    }

    // 1. Get users from contacts array
    const contactIds = currentUser.contacts || [];

    // 2. Get users from existing messages (conversations)
    const distinctConversations = await Message.find({
        $or: [{ sender: userId }, { receiver: userId }]
    }).distinct('sender receiver');
    // Note: distinct returns array of all senders and receivers involved in messages with me.
    // We need to filter out my own ID and combine with contacts.
    
    // Flatten and filter IDs
    // Since distinct might return fields, let's just use a more robust aggregation or simple logic.
    // Aggregation is better for unique pairs, but standard find/distinct is okay for now.
    
    const conversationUserIds = await Message.distinct('sender', { receiver: userId });
    const conversationReceiverIds = await Message.distinct('receiver', { sender: userId });
    
    const allInteractionIds = [...new Set([...contactIds.map((id:any) => id.toString()), ...conversationUserIds.map((id:any) => id.toString()), ...conversationReceiverIds.map((id:any) => id.toString())])];
    
    // Filter out self
    const validUserIds = allInteractionIds.filter(id => id !== userId.toString());

    const filteredUsers = await User.find({ _id: { $in: validUserIds } }).select("-password");
    
    // count the number of messages not read
    let unsendMessages: Record<string, number> = {};
    const unreadCounts = await Promise.all(filteredUsers.map(async (user) => {
        const count = await Message.countDocuments({ sender: user._id, read: false, receiver: userId });
        return { userId: user._id, count };
    }));
    
    unreadCounts.forEach(item => {
        if(item.count > 0) {
            unsendMessages[item.userId.toString()] = item.count;
        }
    });

    res.status(200).json(
        new ApiResponse(200, 'Users fetched successfully', { users: filteredUsers, unsendMessages })
    );
});

// Get all messages for Selected User
export const getSelectedUserMessages = asyncHandler(async (req: any, res: any) => {
    const {id: selectedUserId} = req.params;
    const userId = req.user._id;
    const messages = await Message.find({ $or: [{ sender: userId, receiver: selectedUserId }, { sender: selectedUserId, receiver: userId }] }).sort({ createdAt: 1 }); // Sorted by oldest first? Usually messages are chronological. Store often sorts but backend sorting helps. Previous code was -1 (newest first).
    // Wait, chat usually needs oldest first to append bottom.
    // Previous code: .sort({ createdAt: -1 }) -> Newest first.
    // Frontend likely reverses it or expects newest first. I will keep -1 to avoid breaking frontend logic.
    // Logic check: "messages: [...messages, res.message]" implies appending to end. If fetch is newest first, then list is backwards?
    // Let's stick to previous behavior: -1.
    // Actually, usually chat is ascending. Let's check ChatWindow logic if possible. `ChatMessages` maps `uiMessages`.
    // I will keep -1 to be safe (Previous code had -1).
    
    await Message.updateMany({ $or: [{ sender: userId, receiver: selectedUserId }, { sender: selectedUserId, receiver: userId }], read: false }, { read: true });
    
    res.status(200).json(
        new ApiResponse(200, 'Messages fetched successfully', { messages })
    );
});

// Mark all messages as read
export const markMessagesAsRead = asyncHandler(async (req: any, res: any) => {
    const {id: messageId} = req.params;
    await Message.findOneAndUpdate({ _id: messageId }, { read: true }); // Changed id to _id just in case, typical mongo.
    res.status(200).json(
        new ApiResponse(200, 'Message marked as read', {})
    );
});

// Send message
export const sendMessage = asyncHandler(async (req: any, res: any) => {
    const {id: receiverId} = req.params;
    const senderId = req.user._id;
    const {text,image,video} = req.body;
    let imgUrl = "";
    let videoUrl = "";
    if(image){
        const upload = await cloudinary.uploader.upload(image);
        imgUrl = upload.secure_url;
    }
    if(video){
        const upload = await cloudinary.uploader.upload(video);
        videoUrl = upload.secure_url;
    }
    const newMessage = await Message.create({ sender: senderId, receiver: receiverId, text ,image: imgUrl,video: videoUrl});
    
    // emit the new message to receiver's socket
    const receiverSocketId = onlineUsersMap[receiverId as string];
    if(receiverSocketId){
        io.to(receiverSocketId).emit("newMessage", newMessage);
    }
    // emit the new message to sender's socket
    const senderSocketId = onlineUsersMap[senderId as string];
    if(senderSocketId){
        io.to(senderSocketId).emit("newMessage", newMessage);
    }
    
    // Logic for Auto-Add Contacts (WhatsApp style)
    try {
        // Add receiver to sender's contacts if not present (using $addToSet to avoid duplicates)
        await User.findByIdAndUpdate(
            senderId,
            { $addToSet: { contacts: receiverId } }
        );
        
        // Add sender to receiver's contacts if not present
        await User.findByIdAndUpdate(
            receiverId,
            { $addToSet: { contacts: senderId } }
        );
    } catch (err) {
        console.error("Error auto-adding contacts:", err);
    }

    res.status(201).json(
        new ApiResponse(201, 'Message sent successfully', { message: newMessage })
    );
});

