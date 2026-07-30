import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be positive"],
    },

    type: {
      type: String,
      required: [true, "Type is required"],
      enum: {
        values: ["Income", "Expense"],
        message: "Type should be Income or Expense",
      },
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    paymentMode: {
      type: String,
      required: [true, "Payment mode is required"],
      trim: true,
    },

    note: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);
console.log("=== Expense Model Loaded ===");
console.log("Schema Keys:", Object.keys(expenseSchema.obj));
const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;