import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, required: true },
    paymentMode: { type: String, enum: ['cash', 'card', 'upi', 'bank', 'other'], default: 'other' },
    expenseDate: { type: Date, required: true },
    note: { type: String },
    receiptUrl: { type: String }
  },
  { timestamps: true }
);

export const Expense = mongoose.model('Expense', expenseSchema);

