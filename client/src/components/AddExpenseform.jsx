import { useState } from 'react';
import { useEffect } from "react";
export default function AddExpenseForm({ addExpense , updateExpense, isEditMode , selectedExpense, setExpenses, setIsEditMode, setSelectedExpense }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [note, setNote] = useState('');
  // New State for Error Message
  const [error, setError] = useState('');
  useEffect(() => {
  if (selectedExpense) {
    setTitle(selectedExpense.title);
    setAmount(selectedExpense.amount);
    setCategory(selectedExpense.category);
    setDate(selectedExpense.date);
    setPaymentMode(selectedExpense.paymentMode);
    setNote(selectedExpense.note);
  }
}, [selectedExpense]);
  function handleSubmit(event) {
    event.preventDefault();
    // Validation
    if (title.trim() === '' && amount.trim() === '') {
      setError("Title and Amount are required.");
      return;
    }else if(amount.trim() === ''){
      setError("Amount is required.");
      return;
    }else if(title.trim() === ''){
      setError("Title is required.");
      return;
    }
    // Remove error if validation passes
    setError("");
    const newExpense = {
      id: Date.now(),
      title,
      amount: Number(amount),
      category,
      date,
      paymentMode,
      note
    };
if (isEditMode) {
const updatedExpense = {
  ...selectedExpense,
  title,
  amount: Number(amount),
  category,
  date,
  paymentMode,
  note,
};
  updateExpense(updatedExpense);
  setIsEditMode(false);
  setSelectedExpense(null);
} else {
  addExpense(newExpense);
}
    // Clear Form
    setTitle('');
    setAmount('');
    setCategory('');
    setDate('');
    setPaymentMode('');
    setNote('');
  }
  return (
    <div>
      <h2>{isEditMode ? "Edit Expense" : "Add Expense"}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title: </label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Enter expense title"
          />
        </div>
        <div>
          <label>Amount: </label>
          <input
            type="number"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Enter amount"
          />
        </div>
        <div>
          <label>Category: </label>
          <input
            type="text"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="Enter category"
          />
        </div>
        <div>
          <label>Date: </label>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
        <div>
          <label>Payment Mode: </label>
          <input
            type="text"
            value={paymentMode}
            onChange={(event) => setPaymentMode(event.target.value)}
            placeholder="Enter payment mode"
          />
        </div>
        <div>
          <label>Note: </label>
          <input
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Enter note"
          />
        </div>
        {/* Error Message */}
        {error && (
          <p style={{ color: "red" }}>
            {error}
          </p>
        )}
        <button type="submit">
        {isEditMode ? "Update Expense" : "Add Expense"}
        </button>
      </form>
    </div>
  );
}