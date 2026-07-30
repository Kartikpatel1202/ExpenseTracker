import Expense from "../models/Expense.js";
import mongoose from "mongoose";

// Create Expense
export const addExpense = async (req, res) => {
  try {
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
    const expense = await Expense.findById(id);
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

    const { id } = req.params;      //Level 7 Task 39
    if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid Expense ID",
        data: null,
    });
}        
    const updatedData = req.body;     //level 7 Task 40

    const existingExpense = await Expense.findById(id);
    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

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
    // Read Expense ID
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
        success: false,
        message: "Invalid Expense ID",
        data: null,
    });
}
    // Check if expense exists
    const existingExpense = await Expense.findById(id);

    if (!existingExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    // Delete expense
    await Expense.findByIdAndDelete(id);

    // Return success response
    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });

  } catch (error) {

    // Invalid MongoDB ObjectId
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid Expense ID",
      });
    }

    // Internal Server Error
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};