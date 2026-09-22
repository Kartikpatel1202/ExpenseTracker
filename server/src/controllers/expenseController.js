import Expense from "../models/Expense.js";
import mongoose from "mongoose";

// Create Expense
export const addExpense = async (req, res) => {
  try {
    // Viewer is read-only
    if (req.user.role === "Viewer") {
    return res.status(403).json({
    success: false,
    message: "Viewers cannot create expenses",
    data: null,
    });
    }
    console.log(req.body);
    const {
      title,
      amount,
      type,
      category,
      date,
      paymentMode,
      note,
    } = req.body;
    
    // Validate required fields
    if (!title || !amount || !type || !category || !paymentMode) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    if (!["Income", "Expense"].includes(type)) {
    return res.status(400).json({
    success: false,
    message: "Type must be either Income or Expense",
    data: null,
   });
   }

    // Save expense to MongoDB
    console.log("Schema Paths:", Object.keys(Expense.schema.paths));
    const expense = await Expense.create({
      userId: req.user.userId,
      title,
      amount,
      type,
      category,
      date,
      paymentMode,
      note,
    });
    console.log("Saved Expense:", expense);

    return res.status(201).json({
      success: true,
      message: "Expense added successfully",
      data: expense,
    });

  } catch (error) {
      console.error("=== ADD EXPENSE ERROR ===");
  console.error(error);
  console.error("Error Message:", error.message);
  console.error("Authenticated User:", req.user);


    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(
        (err) => err.message
      );

      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors,
      });
    }

    // Handle other server errors
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Get All Expenses
export const getAllExpenses = async (req, res) => {
  try {
    const {
      category,
      type,
      startDate,
      endDate,
      search,
      sortBy,
      order,
    } = req.query;

    // Filter object
    let filter = {};

// User sees only own expenses.
// Admin and Viewer see all expenses.
   if (req.user.role === "User") {
   filter.userId = req.user.userId;
   } 

    // Category Filter
    if (category) {
      filter.category = category;
    }

    // Type Filter
    if (type) {
      filter.type = type;
    }

    // Date Range Filter
    if (startDate || endDate) {
      filter.date = {};

      if (startDate) {
        filter.date.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.date.$lte = new Date(endDate);
      }
    }
    
    // Search by Title
    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    // Sorting
    let sortOptions = {};

    if (sortBy) {
      const field = sortBy === "date" ? "date" : sortBy;
      sortOptions[field] = order === "desc" ? -1 : 1;
    } else {
      sortOptions.createdAt = -1;
    }

    const expenses = await Expense.find(filter).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid Expense ID",
        data: null,
    });
}
    let expense;

if (
  req.user.role === "Admin" ||
  req.user.role === "Viewer"
) {
  // Admin and Viewer can view any expense
  expense = await Expense.findById(id);
} else {
  // Normal User can view only their own expense
  expense = await Expense.findOne({
    _id: id,
    userId: req.user.userId,
  });
}
    // Expense not found
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }
    // Expense found
    return res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    // Invalid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid Expense ID",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Expense ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Expense ID",
        data: null,
      });
    }

    // Viewer is read-only
    if (req.user.role === "Viewer") {
      return res.status(403).json({
        success: false,
        message: "Viewers cannot update expenses",
        data: null,
      });
    }

    // Find expense
    const existingExpense = await Expense.findById(id);

    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
        data: null,
      });
    }

    // User can update only their own expense
    if (
      req.user.role !== "Admin" &&
      existingExpense.userId.toString() !== req.user.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own expenses",
        data: null,
      });
    }

    // Never allow frontend to change ownership
    const { userId, ...updatedData } = req.body;

    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: updatedExpense,
    });

  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(
        (err) => err.message
      );

      return res.status(400).json({
        success: false,
        message: "Validation Failed",
        errors,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid Expense ID",
        data: null,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate Expense ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Expense ID",
        data: null,
      });
    }

    // Viewer is read-only
    if (req.user.role === "Viewer") {
      return res.status(403).json({
        success: false,
        message: "Viewers cannot delete expenses",
        data: null,
      });
    }

    // Find expense
    const existingExpense = await Expense.findById(id);

    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
        data: null,
      });
    }

    // User can delete only their own expense
    if (
      req.user.role !== "Admin" &&
      existingExpense.userId.toString() !== req.user.userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own expenses",
        data: null,
      });
    }

    // Delete expense
    await Expense.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
      data: null,
    });

  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid Expense ID",
        data: null,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};