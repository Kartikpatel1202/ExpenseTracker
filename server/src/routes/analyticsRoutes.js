import express from "express";

import {
  getSummary,
  getCategoryWiseAnalytics,
  getMonthWiseAnalytics,
} from "../controllers/analyticsController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/summary", authMiddleware, getSummary);

router.get("/category-wise", authMiddleware, getCategoryWiseAnalytics);

router.get("/month-wise", authMiddleware, getMonthWiseAnalytics);

export default router;