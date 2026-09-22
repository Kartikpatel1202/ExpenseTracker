import express from "express";

import {
  addExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET all expenses
router.get("/", authMiddleware, getAllExpenses);

// POST a new expense
router.post("/", authMiddleware, addExpense);

// GET expense by ID
router.get("/:id", authMiddleware, getExpenseById);

// UPDATE expense by ID
router.put("/:id", authMiddleware, updateExpense);

// DELETE expense by ID
router.delete("/:id", authMiddleware, deleteExpense);

export default router;