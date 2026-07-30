import express from "express";
import { getSummary,getCategoryWiseAnalytics,
  getMonthWiseAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

router.get("/summary", getSummary);
router.get("/category-wise", getCategoryWiseAnalytics);
router.get("/month-wise", getMonthWiseAnalytics);
export default router;