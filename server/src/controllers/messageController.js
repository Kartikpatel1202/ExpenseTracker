import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";

// Send Message

export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, message } = req.body;

    // Sender comes from JWT
    const senderId = req.user.userId;

    // Validate receiverId
    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
        data: null,
      });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Receiver ID",
        data: null,
      });
    }

    // Validate message
    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
        data: null,
      });
    }

    // Check receiver exists
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
        data: null,
      });
    }

    // Prevent messaging yourself
    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a message to yourself",
        data: null,
      });
    }

    // Save message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      message: message.trim(),
    });

    // Populate sender and receiver
    const populatedMessage = await Message.findById(
      newMessage._id
    )
      .populate("senderId", "name email role")
      .populate("receiverId", "name email role");

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    return next(error);
  }
};
// Get Conversation
export const getConversation = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const currentUserId = req.user.userId;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
        data: null,
      });
    }

    // Check target user exists
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    // Get messages between both users
    const messages = await Message.find({
      $or: [
        {
          senderId: currentUserId,
          receiverId: userId,
        },
        {
          senderId: userId,
          receiverId: currentUserId,
        },
      ],
    })
      .populate("senderId", "name email role")
      .populate("receiverId", "name email role")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    return next(error);
  }
};

// Get Chat Inbox
export const getInbox = async (req, res, next) => {
  try {
    const currentUserId = req.user.userId;

    // Get all messages where current user is either sender or receiver
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId },
        { receiverId: currentUserId },
      ],
    })
      .populate("senderId", "name email role")
      .populate("receiverId", "name email role")
      .sort({ createdAt: -1 });

    // Store latest conversation for each user
    const inboxMap = new Map();

    for (const message of messages) {
      const senderId = message.senderId._id.toString();
      const receiverId = message.receiverId._id.toString();

      const otherUserId =
        senderId === currentUserId.toString()
          ? receiverId
          : senderId;

      // First message is latest because sorted DESC
      if (!inboxMap.has(otherUserId)) {
        const otherUser =
          senderId === currentUserId.toString()
            ? message.receiverId
            : message.senderId;

        const unreadCount = await Message.countDocuments({
          senderId: otherUserId,
          receiverId: currentUserId,
          isRead: false,
        });

        inboxMap.set(otherUserId, {
          user: otherUser,
          lastMessage: message.message,
          lastMessageTime: message.createdAt,
          unreadCount,
        });
      }
    }

    return res.status(200).json({
      success: true,
      count: inboxMap.size,
      data: Array.from(inboxMap.values()),
    });
  } catch (error) {
    return next(error);
  }
};

// MARK CONVERSATION AS READ

export const markConversationAsRead = async (
  req,
  res,
  next
) => {
  try {
    const currentUserId = req.user.userId;
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID",
        data: null,
      });
    }

    // Mark only messages sent BY the other user  tO the currently logged-in user as read
    await Message.updateMany(
      {
        senderId: userId,
        receiverId: currentUserId,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
        },
      }
    );

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
      data: null,
    });
  } catch (error) {
    return next(error);
  }
};