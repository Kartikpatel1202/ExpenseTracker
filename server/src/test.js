import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import Expense from "./models/Expense.js";

dotenv.config();

const testExpenseModel = async () => {
  try {
    await connectDB();

    const expense = new Expense({
      title: "Lunch",
      amount: 250,
      type: "Expense",
      category: "Food",
      paymentMode: "UPI",
      note: "Lunch with friends",
    });

    const savedExpense = await expense.save();

    console.log("Expense Saved Successfully");
    console.log(savedExpense);

    await mongoose.connection.close();
    console.log("Database Connection Closed");
  } catch (error) {
    console.error(error);
  }
};

testExpenseModel();