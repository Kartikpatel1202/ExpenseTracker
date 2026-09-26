
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import Message from "../models/Message.js";
import User from "../models/User.js";
import Group from "../models/Group.js";
import GroupMessage from "../models/GroupMessage.js";

const onlineUsers = new Map();

// Personal calls: callId -> call details
const activeCalls = new Map();

// Group calls: callId -> group call details
const activeGroupCalls = new Map();

const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  // =====================================================
  // SOCKET AUTHENTICATION
  // =====================================================

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded.userId) {
        return next(new Error("Invalid user in token"));
      }

      socket.user = decoded;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error.message);
      next(new Error("Invalid or expired token"));
    }
  });

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================

  const getGroupRoom = (groupId) => `group:${groupId}`;

  const getGroupParticipants = (call) =>
    [...call.participants.values()].map((participant) => ({
      userId: participant.userId,
      socketId: participant.socketId,
      name: participant.name,
    }));

  const isUserInGroupCall = (userId) => {
    for (const call of activeGroupCalls.values()) {
      if (call.participants.has(userId)) {
        return true;
      }
    }

    return false;
  };

  const isUserInPersonalCall = (userId) => {
    for (const call of activeCalls.values()) {
      if (
        call.callerUserId === userId ||
        call.receiverUserId === userId
      ) {
        return true;
      }
    }

    return false;
  };

  const isUserBusy = (userId) =>
    isUserInPersonalCall(userId) || isUserInGroupCall(userId);

  // =====================================================
  // PERSONAL CALL HISTORY
  // =====================================================

  const savePersonalCallLog = async (io, call, status) => {
    if (!call || call.historySaved) return;

    call.historySaved = true;

    try {
      const endedAt = new Date();

      const duration = call.acceptedAt
        ? Math.max(
            0,
            Math.floor(
              (endedAt.getTime() - call.acceptedAt.getTime()) / 1000
            )
          )
        : 0;

      const callLog = {
        type: "call",
        callType: call.callType,
        status,
        duration,
        startedAt: call.startedAt || endedAt,
        endedAt,
      };

      const created = await Message.create({
        senderId: call.callerUserId,
        receiverId: call.receiverUserId,
        message: `__CALL_LOG__${JSON.stringify(callLog)}`,
      });

      const savedMessage = await Message.findById(created._id)
        .populate("senderId", "name email role")
        .populate("receiverId", "name email role");

      const callerSocketId =
        onlineUsers.get(call.callerUserId) || call.callerSocketId;

      const receiverSocketId =
        onlineUsers.get(call.receiverUserId) || call.receiverSocketId;

      if (callerSocketId) {
        io.to(callerSocketId).emit("new_message", savedMessage);
        io.to(callerSocketId).emit("message_sent", savedMessage);
      }

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("new_message", savedMessage);
      }
    } catch (error) {
      call.historySaved = false;
      console.error("Failed to save personal call history:", error);
    }
  };

  // =====================================================
  // GROUP CALL HISTORY
  // =====================================================

  const saveGroupCallLog = async (io, call) => {
    if (!call || call.historySaved) return;

    call.historySaved = true;

    try {
      const endedAt = new Date();

      const duration = call.startedAt
        ? Math.max(
            0,
            Math.floor(
              (endedAt.getTime() - call.startedAt.getTime()) / 1000
            )
          )
        : 0;

      const callLog = {
        type: "call",
        callType: call.callType,
        status: "completed",
        duration,
        startedAt: call.startedAt || endedAt,
        endedAt,
      };

      const created = await GroupMessage.create({
        groupId: call.groupId,
        senderId: call.callerUserId,
        message: `__CALL_LOG__${JSON.stringify(callLog)}`,
      });

      const savedMessage = await GroupMessage.findById(created._id)
        .populate("senderId", "name email role");

      io.to(getGroupRoom(call.groupId)).emit(
        "new_group_message",
        savedMessage
      );
    } catch (error) {
      call.historySaved = false;
      console.error("Failed to save group call history:", error);
    }
  };

  // =====================================================
  // REMOVE GROUP PARTICIPANT
  // =====================================================

  const removeGroupParticipant = (callId, userId, socketId) => {
    const call = activeGroupCalls.get(callId);

    if (!call) return;

    const participant = call.participants.get(userId);

    if (!participant || participant.socketId !== socketId) {
      return;
    }

    call.participants.delete(userId);

    // Notify remaining participants that this user left.
    for (const remaining of call.participants.values()) {
      io.to(remaining.socketId).emit("group_call_peer_left", {
        callId,
        socketId,
        userId,
        name: participant.name,
      });
    }

    // End the call when nobody remains.
    if (call.participants.size === 0) {
      activeGroupCalls.delete(callId);
      void saveGroupCallLog(io, call);
      return;
    }

    // Send the updated participant list.
    const participants = getGroupParticipants(call);

    for (const remaining of call.participants.values()) {
      io.to(remaining.socketId).emit("group_call_participants", {
        callId,
        participants,
      });
    }
  };

  // =====================================================
  // CONNECTION
  // =====================================================

  io.on("connection", async (socket) => {
    const userId = socket.user.userId.toString();

    try {
      console.log(`Socket connected: ${userId} | ${socket.id}`);

      onlineUsers.set(userId, socket.id);

      const currentUser = await User.findById(userId).select("name");

      // =================================================
      // JOIN ALL GROUP ROOMS OF THIS USER
      // =================================================

      try {
        const userGroups = await Group.find({
          members: userId,
        }).select("_id");

        for (const group of userGroups) {
          socket.join(getGroupRoom(group._id.toString()));
        }

        console.log(
          `User ${userId} joined ${userGroups.length} group room(s)`
        );
      } catch (error) {
        console.error("Failed to join group rooms:", error);
      }

      // =====================================================
      // ONE-TO-ONE CHAT
      // =====================================================

      socket.on("send_message", async (data) => {
        try {
          const { receiverId, message } = data || {};

          if (
            !receiverId ||
            !mongoose.Types.ObjectId.isValid(receiverId)
          ) {
            socket.emit("message_error", {
              message: "Invalid receiver ID",
            });
            return;
          }

          if (!message || typeof message !== "string" || !message.trim()) {
            socket.emit("message_error", {
              message: "Message is required",
            });
            return;
          }

          if (receiverId.toString() === userId) {
            socket.emit("message_error", {
              message: "You cannot message yourself",
            });
            return;
          }

          const receiver = await User.findById(receiverId);

          if (!receiver) {
            socket.emit("message_error", {
              message: "Receiver not found",
            });
            return;
          }

          const newMessage = await Message.create({
            senderId: userId,
            receiverId,
            message: message.trim(),
          });

          const savedMessage = await Message.findById(newMessage._id)
            .populate("senderId", "name email role")
            .populate("receiverId", "name email role");

          socket.emit("message_sent", savedMessage);

          const receiverSocketId = onlineUsers.get(
            receiverId.toString()
          );

          if (receiverSocketId) {
            io.to(receiverSocketId).emit("new_message", savedMessage);
          }

          console.log(`Message saved: ${userId} -> ${receiverId}`);
        } catch (error) {
          console.error("Socket message error:", error);

          socket.emit("message_error", {
            message: "Failed to send message",
          });
        }
      });

      // =====================================================
      // GROUP CHAT
      // =====================================================

      socket.on("send_group_message", async (data) => {
        try {
          const { groupId, message } = data || {};

          if (
            !groupId ||
            !mongoose.Types.ObjectId.isValid(groupId)
          ) {
            socket.emit("group_message_error", {
              message: "Invalid group ID",
            });
            return;
          }

          if (!message || typeof message !== "string" || !message.trim()) {
            socket.emit("group_message_error", {
              message: "Message is required",
            });
            return;
          }

          const group = await Group.findOne({
            _id: groupId,
            members: userId,
          });

          if (!group) {
            socket.emit("group_message_error", {
              message: "Group not found or you are not a member",
            });
            return;
          }

          const newGroupMessage = await GroupMessage.create({
            groupId,
            senderId: userId,
            message: message.trim(),
          });

          const savedGroupMessage = await GroupMessage.findById(
            newGroupMessage._id
          ).populate("senderId", "name email role");

          io.to(getGroupRoom(groupId)).emit(
            "new_group_message",
            savedGroupMessage
          );

          console.log(
            `Group message saved: ${userId} -> group ${groupId}`
          );
        } catch (error) {
          console.error("Group socket message error:", error);

          socket.emit("group_message_error", {
            message: "Failed to send group message",
          });
        }
      });

      // =====================================================
      // PERSONAL AUDIO / VIDEO CALLS
      // =====================================================

      // START PERSONAL CALL
      socket.on("call_user", async (data) => {
        try {
          const { receiverId, callType } = data || {};

          if (
            !receiverId ||
            !mongoose.Types.ObjectId.isValid(receiverId) ||
            receiverId.toString() === userId ||
            !["audio", "video"].includes(callType)
          ) {
            socket.emit("call_error", {
              message: "Invalid call details",
            });
            return;
          }

          if (isUserBusy(userId)) {
            socket.emit("call_error", {
              message: "You are already in a call",
            });
            return;
          }

          if (isUserBusy(receiverId.toString())) {
            socket.emit("call_error", {
              message: "The user is already in a call",
            });
            return;
          }

          const receiver = await User.findById(receiverId).select("name");

          if (!receiver) {
            socket.emit("call_error", {
              message: "User not found",
            });
            return;
          }

          const receiverSocketId = onlineUsers.get(
            receiverId.toString()
          );

          if (!receiverSocketId) {
            socket.emit("call_error", {
              message: "User is offline",
            });
            return;
          }

          const caller = await User.findById(userId).select("name");
          const callId = `${socket.id}-${Date.now()}`;

          activeCalls.set(callId, {
            callerUserId: userId,
            callerSocketId: socket.id,
            receiverUserId: receiverId.toString(),
            receiverSocketId,
            callType,
            startedAt: new Date(),
            acceptedAt: null,
            historySaved: false,
          });

          io.to(receiverSocketId).emit("incoming_call", {
            callId,
            callerId: userId,
            callerName: caller?.name || "User",
            callType,
          });

          socket.emit("call_ringing", {
            callId,
            receiverId: receiverId.toString(),
            receiverName: receiver.name,
            callType,
          });
        } catch (error) {
          console.error("Call initiation error:", error);

          socket.emit("call_error", {
            message: "Failed to start call",
          });
        }
      });

      // ACCEPT PERSONAL CALL
      socket.on("accept_call", (data) => {
        const { callId } = data || {};
        const call = activeCalls.get(callId);

        if (
          !call ||
          call.receiverSocketId !== socket.id ||
          call.receiverUserId !== userId
        ) {
          socket.emit("call_error", {
            message: "Invalid or expired call",
          });
          return;
        }

        call.acceptedAt = new Date();

        io.to(call.callerSocketId).emit("call_accepted", {
          callId,
          receiverId: userId,
        });
      });

      // REJECT PERSONAL CALL
      socket.on("reject_call", (data) => {
        const { callId } = data || {};
        const call = activeCalls.get(callId);

        if (
          !call ||
          call.receiverSocketId !== socket.id ||
          call.receiverUserId !== userId
        ) {
          return;
        }

        io.to(call.callerSocketId).emit("call_rejected", {
          callId,
          receiverId: userId,
        });

        activeCalls.delete(callId);
        void savePersonalCallLog(io, call, "missed");
      });

      // PERSONAL WEBRTC OFFER
      socket.on("webrtc_offer", (data) => {
        const { callId, offer } = data || {};
        const call = activeCalls.get(callId);

        if (
          !call ||
          call.callerSocketId !== socket.id ||
          call.callerUserId !== userId ||
          !offer
        ) {
          socket.emit("call_error", {
            message: "Invalid WebRTC offer",
          });
          return;
        }

        io.to(call.receiverSocketId).emit("webrtc_offer", {
          callId,
          offer,
          fromUserId: userId,
        });
      });

      // PERSONAL WEBRTC ANSWER
      socket.on("webrtc_answer", (data) => {
        const { callId, answer } = data || {};
        const call = activeCalls.get(callId);

        if (
          !call ||
          call.receiverSocketId !== socket.id ||
          call.receiverUserId !== userId ||
          !answer
        ) {
          socket.emit("call_error", {
            message: "Invalid WebRTC answer",
          });
          return;
        }

        io.to(call.callerSocketId).emit("webrtc_answer", {
          callId,
          answer,
          fromUserId: userId,
        });
      });

      // PERSONAL ICE CANDIDATE
      socket.on("webrtc_ice_candidate", (data) => {
        const { callId, candidate } = data || {};
        const call = activeCalls.get(callId);

        if (!call || !candidate) return;

        let targetSocketId;

        if (
          call.callerSocketId === socket.id &&
          call.callerUserId === userId
        ) {
          targetSocketId = call.receiverSocketId;
        } else if (
          call.receiverSocketId === socket.id &&
          call.receiverUserId === userId
        ) {
          targetSocketId = call.callerSocketId;
        } else {
          return;
        }

        io.to(targetSocketId).emit("webrtc_ice_candidate", {
          callId,
          candidate,
          fromUserId: userId,
        });
      });

      // END PERSONAL CALL
      socket.on("end_call", (data) => {
        const { callId } = data || {};
        const call = activeCalls.get(callId);

        if (!call) return;

        let otherSocketId;

        if (
          call.callerSocketId === socket.id &&
          call.callerUserId === userId
        ) {
          otherSocketId = call.receiverSocketId;
        } else if (
          call.receiverSocketId === socket.id &&
          call.receiverUserId === userId
        ) {
          otherSocketId = call.callerSocketId;
        } else {
          return;
        }

        io.to(otherSocketId).emit("call_ended", {
          callId,
          byUserId: userId,
        });

        activeCalls.delete(callId);
        void savePersonalCallLog(
          io,
          call,
          call.acceptedAt ? "completed" : "cancelled"
        );
      });

      // =====================================================
      // GROUP AUDIO / VIDEO CALLS
      // =====================================================

      // START A GROUP CALL
      socket.on("group_call_start", async (data) => {
        try {
          const { groupId, callType } = data || {};

          if (
            !groupId ||
            !mongoose.Types.ObjectId.isValid(groupId) ||
            !["audio", "video"].includes(callType)
          ) {
            socket.emit("group_call_error", {
              message: "Invalid group call details",
            });
            return;
          }

          if (isUserBusy(userId)) {
            socket.emit("group_call_error", {
              message: "You are already in a call",
            });
            return;
          }

          const group = await Group.findOne({
            _id: groupId,
            members: userId,
          });

          if (!group) {
            socket.emit("group_call_error", {
              message: "Group not found or you are not a member",
            });
            return;
          }

          // Prevent two simultaneous calls in the same group.
          const existingGroupCall = [...activeGroupCalls.values()].find(
            (call) => call.groupId === groupId.toString()
          );

          if (existingGroupCall) {
            socket.emit("group_call_error", {
              message: "A call is already active in this group",
            });
            return;
          }

          const callId = `group-${groupId}-${Date.now()}`;
          const callerName = currentUser?.name || "User";

          const call = {
            callId,
            groupId: groupId.toString(),
            groupName: group.name || group.groupName || "Group",
            callType,
            callerUserId: userId,
            startedAt: new Date(),
            historySaved: false,
            participants: new Map(),
          };

          call.participants.set(userId, {
            userId,
            socketId: socket.id,
            name: callerName,
          });

          activeGroupCalls.set(callId, call);

          const participants = getGroupParticipants(call);

          // Tell the caller the call has started.
          socket.emit("group_call_started", {
            callId,
            groupId: call.groupId,
            groupName: call.groupName,
            callType,
            participants,
          });

          // Notify all other online members of the group.
          for (const memberId of group.members) {
            const memberUserId = memberId.toString();

            if (memberUserId === userId) continue;

            const memberSocketId = onlineUsers.get(memberUserId);

            if (!memberSocketId) continue;

            io.to(memberSocketId).emit("group_call_incoming", {
              callId,
              groupId: call.groupId,
              groupName: call.groupName,
              callerId: userId,
              callerName,
              callType,
            });
          }

          console.log(
            `Group call started: ${callId} by ${userId}`
          );
        } catch (error) {
          console.error("Group call start error:", error);

          socket.emit("group_call_error", {
            message: "Failed to start group call",
          });
        }
      });

      // JOIN AN EXISTING GROUP CALL
      socket.on("group_call_join", async (data) => {
        try {
          const { callId, groupId } = data || {};
          const call = activeGroupCalls.get(callId);

          if (!call || call.groupId !== groupId?.toString()) {
            socket.emit("group_call_error", {
              message: "This group call is no longer available",
            });
            return;
          }

          if (isUserInPersonalCall(userId)) {
            socket.emit("group_call_error", {
              message: "You are already in a personal call",
            });
            return;
          }

          const group = await Group.findOne({
            _id: call.groupId,
            members: userId,
          });

          if (!group) {
            socket.emit("group_call_error", {
              message: "You are not a member of this group",
            });
            return;
          }

          const existingParticipant = call.participants.get(userId);

          if (
            existingParticipant &&
            existingParticipant.socketId !== socket.id
          ) {
            socket.emit("group_call_error", {
              message: "You are already in this call on another connection",
            });
            return;
          }

          const user = await User.findById(userId).select("name");

          call.participants.set(userId, {
            userId,
            socketId: socket.id,
            name: user?.name || "Participant",
          });

          const participants = getGroupParticipants(call);

          // Send the current participant list to the joining user.
          socket.emit("group_call_participants", {
            callId,
            participants,
          });

          // Tell everyone else that this participant joined.
          for (const participant of call.participants.values()) {
            if (participant.socketId === socket.id) continue;

            io.to(participant.socketId).emit("group_call_peer_joined", {
              callId,
              participant: {
                userId,
                socketId: socket.id,
                name: user?.name || "Participant",
              },
            });
          }

          console.log(`User ${userId} joined group call ${callId}`);
        } catch (error) {
          console.error("Group call join error:", error);

          socket.emit("group_call_error", {
            message: "Failed to join group call",
          });
        }
      });

      // REJECT AN INCOMING GROUP CALL
      socket.on("group_call_reject", (data) => {
        const { callId } = data || {};
        const call = activeGroupCalls.get(callId);

        if (!call) return;

        // Only a member of the group can reject.
        const caller = call.participants.values().next().value;

        if (caller) {
          io.to(caller.socketId).emit("group_call_rejected", {
            callId,
            userId,
            name: currentUser?.name || "Participant",
          });
        }
      });

      // LEAVE A GROUP CALL
      socket.on("group_call_leave", (data) => {
        const { callId } = data || {};
        removeGroupParticipant(callId, userId, socket.id);

        console.log(`User ${userId} left group call ${callId}`);
      });

      // GROUP WEBRTC OFFER
      socket.on("group_webrtc_offer", (data) => {
        const { callId, to, offer } = data || {};
        const call = activeGroupCalls.get(callId);

        if (!call || !to || !offer) return;

        const sender = call.participants.get(userId);
        const receiver = [...call.participants.values()].find(
          (participant) => participant.socketId === to
        );

        if (!sender || !receiver) return;

        io.to(receiver.socketId).emit("group_webrtc_offer", {
          callId,
          from: socket.id,
          offer,
          name: sender.name,
        });
      });

      // GROUP WEBRTC ANSWER
      socket.on("group_webrtc_answer", (data) => {
        const { callId, to, answer } = data || {};
        const call = activeGroupCalls.get(callId);

        if (!call || !to || !answer) return;

        const sender = call.participants.get(userId);
        const receiver = [...call.participants.values()].find(
          (participant) => participant.socketId === to
        );

        if (!sender || !receiver) return;

        io.to(receiver.socketId).emit("group_webrtc_answer", {
          callId,
          from: socket.id,
          answer,
        });
      });

      // GROUP WEBRTC ICE CANDIDATE
      socket.on("group_webrtc_ice_candidate", (data) => {
        const { callId, to, candidate } = data || {};
        const call = activeGroupCalls.get(callId);

        if (!call || !to || !candidate) return;

        const sender = call.participants.get(userId);
        const receiver = [...call.participants.values()].find(
          (participant) => participant.socketId === to
        );

        if (!sender || !receiver) return;

        io.to(receiver.socketId).emit(
          "group_webrtc_ice_candidate",
          {
            callId,
            from: socket.id,
            candidate,
          }
        );
      });

      // =====================================================
      // DISCONNECT
      // =====================================================

      socket.on("disconnect", () => {
        // Remove online mapping only if this socket is current.
        if (onlineUsers.get(userId) === socket.id) {
          onlineUsers.delete(userId);
        }

        // End any personal calls involving this socket.
        for (const [callId, call] of activeCalls.entries()) {
          if (
            call.callerSocketId === socket.id ||
            call.receiverSocketId === socket.id
          ) {
            const otherSocketId =
              call.callerSocketId === socket.id
                ? call.receiverSocketId
                : call.callerSocketId;

            io.to(otherSocketId).emit("call_ended", {
              callId,
              byUserId: userId,
              reason: "disconnected",
            });

            activeCalls.delete(callId);
            void savePersonalCallLog(
              io,
              call,
              call.acceptedAt ? "completed" : "cancelled"
            );
          }
        }

        // Remove the user from any group calls.
        for (const [callId, call] of activeGroupCalls.entries()) {
          if (call.participants.get(userId)?.socketId === socket.id) {
            removeGroupParticipant(callId, userId, socket.id);
          }
        }

        console.log(`Socket disconnected: ${userId} | ${socket.id}`);
      });
    } catch (error) {
      console.error("Socket connection setup error:", error);
      socket.disconnect();
    }
  });

  return io;
};

export { initializeSocket };