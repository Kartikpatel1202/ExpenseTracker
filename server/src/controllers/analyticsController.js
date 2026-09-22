import Expense from "../models/Expense.js";
import mongoose from "mongoose";

// Get Summary Analytics
export const getSummary = async (req, res, next) => {
  try {
    // User sees only their own expenses.
    // Admin and Viewer see all expenses.
    const filter =
      req.user.role === "User"
        ? { userId: req.user.userId }
        : {};

    const expenses = await Expense.find(filter);

    let totalIncome = 0;
    let totalExpense = 0;
    let highestExpense = null;

    expenses.forEach((expense) => {
      if (expense.type === "Income") {
        totalIncome += expense.amount;
      } else {
        totalExpense += expense.amount;

        if (
          highestExpense === null ||
          expense.amount > highestExpense.amount
        ) {
          highestExpense = expense;
        }
      }
    });

    const balance = totalIncome - totalExpense;

    return res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance,
        totalTransactions: expenses.length,
        highestExpense,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get Category-wise Analytics
export const getCategoryWiseAnalytics = async (req, res, next) => {
  try {
    const analytics = await Expense.aggregate([
      {
        $match: {
          type: "Expense",

          // User sees only their own data.
          // Admin and Viewer see all data.
          ...(req.user.role === "User"
            ? {
                userId: new mongoose.Types.ObjectId(
                  req.user.userId
                ),
              }
            : {}),
        },
      },

      {
        $group: {
          _id: "$category",
          totalAmount: {
            $sum: "$amount",
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

// Get Month-wise Analytics
export const getMonthWiseAnalytics = async (req, res, next) => {
  try {
    const analytics = await Expense.aggregate([
      {
        $match:
          req.user.role === "User"
            ? {
                userId: new mongoose.Types.ObjectId(
                  req.user.userId
                ),
              }
            : {},
      },

      {
        $group: {
          _id: {
            month: {
              $month: "$date",
            },
          },

          totalIncome: {
            $sum: {
              $cond: [
                { $eq: ["$type", "Income"] },
                "$amount",
                0,
              ],
            },
          },

          totalExpense: {
            $sum: {
              $cond: [
                { $eq: ["$type", "Expense"] },
                "$amount",
                0,
              ],
            },
          },
        },
      },

      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};