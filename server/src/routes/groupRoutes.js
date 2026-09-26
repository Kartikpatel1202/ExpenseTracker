import express from "express";

import {
  createGroup,
  getMyGroups,
  getGroupMessages,
} from "../controllers/groupController.js";

import {
  authMiddleware,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getMyGroups
);

router.post(
  "/",
  authMiddleware,
  createGroup
);

router.get(
  "/:groupId/messages",
  authMiddleware,
  getGroupMessages
);

export default router;