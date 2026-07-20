import mongoose from 'mongoose';

const splitSchema = new mongoose.Schema(
  {
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
    expenseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Expense' },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        shareAmount: { type: Number, required: true, min: 0 },
        settled: { type: Boolean, default: false }
      }
    ]
  },
  { timestamps: true }
);

export const Split = mongoose.model('Split', splitSchema);

