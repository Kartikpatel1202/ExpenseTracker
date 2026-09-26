import mongoose from "mongoose";

const callDetailsSchema = new mongoose.Schema(
  {
    callType: {
      type: String,
      enum: ["audio", "video"],
    },

    status: {
      type: String,
      enum: ["completed", "missed", "cancelled"],
    },

    duration: {
      type: Number,
      default: 0,
      min: 0,
    },

    startedAt: {
      type: Date,
    },

    endedAt: {
      type: Date,
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Sender is required"],
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Receiver is required"],
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
    },

    messageType: {
      type: String,
      enum: ["text", "call"],
      default: "text",
    },

    callDetails: {
      type: callDetailsSchema,
      default: undefined,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Detect call logs created by the updated socket.js
messageSchema.pre("validate", function (next) {
  if (this.message?.startsWith("__CALL_LOG__")) {
    try {
      const callData = JSON.parse(
        this.message.substring("__CALL_LOG__".length)
      );

      this.messageType = "call";
      this.callDetails = callData;
    } catch (error) {
      return next(
        new Error("Invalid call log data")
      );
    }
  }

  next();
});

const Message = mongoose.model("Message", messageSchema);

export default Message;