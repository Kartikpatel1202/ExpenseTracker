import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Message from "../models/Message.js";
import User from "../models/User.js";

const onlineUsers = new Map();

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  // Socket Authentication

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      socket.user = decoded;

      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  // Connection

  io.on("connection", (socket) => {
    const userId = socket.user.userId.toString();

    console.log(
      `Socket connected: ${userId} | ${socket.id}`
    );

    // Store user -> socket mapping
    onlineUsers.set(userId, socket.id);

    // Send Message
    socket.on("send_message", async (data) => {
      try {
        const { receiverId, message } = data;

        // Validate receiver
        if (
          !receiverId ||
          !mongoose.Types.ObjectId.isValid(receiverId)
        ) {
          socket.emit("message_error", {
            message: "Invalid receiver ID",
          });

          return;
        }

        // Validate message
        if (!message || !message.trim()) {
          socket.emit("message_error", {
            message: "Message is required",
          });

          return;
        }

        // Check receiver exists
        const receiver = await User.findById(receiverId);

        if (!receiver) {
          socket.emit("message_error", {
            message: "Receiver not found",
          });

          return;
        }

        // Prevent self messaging
        if (userId === receiverId.toString()) {
          socket.emit("message_error", {
            message: "You cannot message yourself",
          });

          return;
        }

        // Save message to MongoDB

        const newMessage = await Message.create({
          senderId: userId,
          receiverId,
          message: message.trim(),
        });


        // Populate sender + receiver
        const savedMessage = await Message.findById(
          newMessage._id
        )
          .populate("senderId", "name email role")
          .populate("receiverId", "name email role");


        console.log(
          `Message saved: ${userId} -> ${receiverId}`
        );
        // Send to Sender

        socket.emit(
          "message_sent",
          savedMessage
        );

        // Send to Receiver if Online

        const receiverSocketId =
          onlineUsers.get(receiverId.toString());

        if (receiverSocketId) {
          io.to(receiverSocketId).emit(
            "new_message",
            savedMessage
          );

          console.log(
            `Message delivered to socket: ${receiverSocketId}`
          );
        } else {
          console.log(
            `Receiver ${receiverId} is offline`
          );
        }

      } catch (error) {
        console.error(
          "Socket message error:",
          error
        );

        socket.emit("message_error", {
          message: "Failed to send message",
        });
      }
    });

    // Disconnect

    socket.on("disconnect", () => {
      const currentSocketId =
        onlineUsers.get(userId);

      // Only delete if this is the active socket
      if (currentSocketId === socket.id) {
        onlineUsers.delete(userId);
      }

      console.log(
        `Socket disconnected: ${userId} | ${socket.id}`
      );
    });
  });


  return io;
};
export {initializeSocket};