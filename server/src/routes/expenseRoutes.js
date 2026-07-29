import express from "express";
import { addExpense ,getAllExpenses, getExpenseById ,updateExpense, deleteExpense } from "../controllers/expenseController.js";
const router = express.Router();

// GET all expenses
router.get("/", getAllExpenses);

// POST a new expense
router.post("/", addExpense);

// GET expense by ID
router.get("/:id", getExpenseById);

// UPDATE expense by ID
router.put("/:id", updateExpense);

// DELETE expense by ID
router.delete("/:id", deleteExpense);

export default router;