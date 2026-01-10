import { Request, Response } from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { Types } from 'mongoose';

// Get or create a conversation between two users
export const getOrCreateConversation = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user._id;

    // Ensure we have valid ObjectIds
    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const conversation = await Conversation.findOrCreate(currentUser, userId);
    
    // Populate participants and last message
    await conversation.populate([
      { path: 'participants', select: 'name email profilePic online lastSeen' },
      { path: 'lastMessage' }
    ]);

    res.json({ success: true, conversation });
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all conversations for the current user
export const getUserConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: { $in: [userId] },
    })
      .populate({
        path: 'participants',
        select: 'name email profilePic online lastSeen',
        match: { _id: { $ne: userId } }, // Exclude current user
      })
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    // Calculate unread counts for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await Message.countDocuments({
          conversation: conversation._id,
          sender: { $ne: userId },
          read: false,
        });

        return {
          ...conversation.toObject(),
          unreadCount,
        };
      })
    );

    res.json({ success: true, conversations: conversationsWithUnread });
  } catch (error) {
    console.error('Error in getUserConversations:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update conversation (mark as read, etc.)
export const updateConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const { lastMessage, unreadCount } = req.body;

    const updates: any = {};
    if (lastMessage) updates.lastMessage = lastMessage;
    if (unreadCount !== undefined) updates.unreadCount = unreadCount;

    const conversation = await Conversation.findByIdAndUpdate(
      conversationId,
      { $set: updates },
      { new: true }
    )
      .populate('participants', 'name email profilePic online lastSeen')
      .populate('lastMessage');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    res.json({ success: true, conversation });
  } catch (error) {
    console.error('Error in updateConversation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a conversation
export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify the user is a participant in the conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    // Delete all messages in the conversation
    await Message.deleteMany({ conversation: conversationId });
    
    // Delete the conversation
    await Conversation.findByIdAndDelete(conversationId);

    res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error in deleteConversation:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
