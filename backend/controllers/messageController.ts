import cloudinary from "../lib/cloudinary.ts";
import Message from "../models/Message.ts";
import User from "../models/User.ts";
import { onlineUsersMap,io } from "../server.ts";


// Get all User except current user
export const getAllUsers = async (req: any, res: any) => {
    try {
        const userId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");
        res.json({ success: true, users: filteredUsers })
        // count the number of messages not read
        let unsendMessages = {};
        const promises = await filteredUsers.map( async (user) => {
            const messages = await Message.find({ sender: user._id, read: false, receiver: userId });
            if(messages.length > 0){
                unsendMessages[user._id as unknown as string] = messages.length;
            }
        });
        await Promise.all(promises);
        res.json({ success: true, unsendMessages,users: filteredUsers })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}

// Get all messages for Selected User
export const getSelectedUserMessages = async (req: any, res: any) => {
    try {
        const {id: selectedUserId} = req.params;
        const userId = req.user._id;
        const messages = await Message.find({ $or: [{ sender: userId, receiver: selectedUserId }, { sender: selectedUserId, receiver: userId }] }).sort({ createdAt: -1 });
        await Message.updateMany({ $or: [{ sender: userId, receiver: selectedUserId }, { sender: selectedUserId, receiver: userId }], read: false }, { read: true });
        res.json({ success: true, messages })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }   
}

// Mark all messages as read
export const markMessagesAsRead = async (req: any, res: any) => {
    try {
        const {id: messageId} = req.params;
        // const userId = req.user._id;
        await Message.findOneAndUpdate({ id: messageId }, { read: true });
        res.json({ success: true })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }   
}

// Send message
export const sendMessage = async (req: any, res: any) => {
    try {
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
        res.json({ success: true, message: newMessage })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }   
}

