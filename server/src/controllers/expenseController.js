import Expense from "../models/Expense.js";

// Create Expense
export const addExpense = async (req, res) => {
  try {
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

    // Save expense to MongoDB
    const expense = await Expense.create({
      title,
      amount,
      type,
      category,
      date,
      paymentMode,
      note,
    });

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

    // Read category from query parameter
    const { category } = req.query;

    // Create filter object
    let filter = {};

    // Apply category filter
    if (category) {
      filter.category = category;
    }

    // Fetch expenses
    const expenses = await Expense.find(filter).sort({ createdAt: -1 });

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

    const { id } = req.params;        //Level 7 Task 39
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