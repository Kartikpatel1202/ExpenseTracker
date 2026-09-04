import { useState } from 'react';
import { useEffect } from "react";
import { X } from "lucide-react";
export default function AddExpenseForm({ onAddExpense , updateExpense, isEditMode , selectedExpense, setExpenses, setIsEditMode, setSelectedExpense, onClose }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState("Expense");
  // New State for Error Message
  const [error, setError] = useState('');
useEffect(() => {
  if (selectedExpense) {
    // Coerce to strings so every input stays controlled and the string-based
    // validation below cannot crash on a numeric amount coming from the API.
    setTitle(selectedExpense.title ?? '');
    setAmount(String(selectedExpense.amount ?? ''));
    setType(selectedExpense.type ?? 'Expense');
    setCategory(selectedExpense.category ?? '');
    // The API returns an ISO timestamp; <input type="date"> needs YYYY-MM-DD.
    setDate(selectedExpense.date ? String(selectedExpense.date).slice(0, 10) : '');
    setPaymentMode(selectedExpense.paymentMode ?? '');
    setNote(selectedExpense.note ?? '');
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
  title,
  amount: Number(amount),
  type,
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
  type,
  category,
  date,
  paymentMode,
  note,
};
  updateExpense(updatedExpense);
  setIsEditMode(false);
  setSelectedExpense(null);
} else {
  onAddExpense(newExpense);
}
    // Clear Form
    setTitle('');
    setAmount('');
    setType("Expense");
    setCategory('');
    setDate('');
    setPaymentMode('');
    setNote('');
  }
  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={isEditMode ? "Edit Expense" : "Add Expense"}>
      <div className="modal">
        <div className="modal-head">
          <h2 className="card-title">{isEditMode ? "Edit Expense" : "Add Expense"}</h2>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Close form">
            <X size={16} />
          </button>
        </div>

        <form className="expense-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="expense-title">Title</label>
            <input
              id="expense-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter expense title"
            />
          </div>
          <div className="field">
            <label htmlFor="expense-amount">Amount</label>
            <input
              id="expense-amount"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
            />
          </div>
          <div className="field">
            <label htmlFor="expense-type">Type</label>
            <select
              id="expense-type"
              value={type}
              onChange={(event) => setType(event.target.value)}
            >
              <option value="Expense">Expense</option>
              <option value="Income">Income</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="expense-category">Category</label>
            <input
              id="expense-category"
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="Enter category"
            />
          </div>
          <div className="field">
            <label htmlFor="expense-date">Date</label>
            <input
              id="expense-date"
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="expense-payment-mode">Payment Mode</label>
            <input
              id="expense-payment-mode"
              type="text"
              value={paymentMode}
              onChange={(event) => setPaymentMode(event.target.value)}
              placeholder="Enter payment mode"
            />
          </div>
          <div className="field field--full">
            <label htmlFor="expense-note">Note</label>
            <input
              id="expense-note"
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Enter note"
            />
          </div>
          {/* Error Message */}
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditMode ? "Update Expense" : "Add Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
