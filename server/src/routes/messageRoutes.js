import express from "express";

import {
  sendMessage,
  getConversation,
  getInbox,
  markConversationAsRead,
} from "../controllers/messageController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put(
  "/:userId/read",
  authMiddleware,
  markConversationAsRead
);

// Get Chat Inbox
router.get(
  "/inbox",
  authMiddleware,
  getInbox
);


// Get conversation with a specific user
router.get(
  "/:userId",
  authMiddleware,
  getConversation
);


// Send Message
router.post(
  "/",
  authMiddleware,
  sendMessage
);

export default router;