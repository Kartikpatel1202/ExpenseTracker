import { useState, useEffect } from 'react';
import AddExpenseForm from './AddExpenseForm.jsx';
import ExpenseSummary from './ExpenseSummary.jsx';
import ExpenseList from './ExpenseList.jsx';
import StateDemo from './StateDemo.jsx';
import ExpenseTotals from "./ExpenseTotals";

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [history, setHistory] = useState([]);
  console.log("History:", history);
  console.log("ExpenseTracker Rendered");
  console.log("Current expenses:", expenses);
  const [showSummary, setShowSummary] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sortBy, setSortBy] = useState("none");

// level 11 task 73
function saveCurrentState() {
  setHistory((previousHistory) => [
    ...previousHistory,
    expenses,
  ]);
}
  // Level 4
function addExpense(newExpense) {
  saveCurrentState();
  setExpenses((previousExpenses) => [
    ...previousExpenses,
    newExpense,
  ]);
}
function deleteExpense(id) {
  saveCurrentState();
  setExpenses((previousExpenses) =>
    previousExpenses.filter(
      (expense) => expense.id !== id
    )
  );
}
function updateExpense(updatedExpense) {
  saveCurrentState();
  setExpenses((previousExpenses) =>
    previousExpenses.map((expense) =>
      expense.id === updatedExpense.id
        ? updatedExpense
        : expense
    )
  );
}
function editExpense(expense) {
  setSelectedExpense(expense);
  setIsEditMode(true);
}

function selectExpense(expense) {
  setSelectedExpense(expense);
}
const filteredExpenses =
  selectedCategory === "All"
    ? expenses
    : expenses.filter(
        (expense) => expense.category === selectedCategory
);
const sortedExpenses = [...filteredExpenses];
if (sortBy === "amount") {
  sortedExpenses.sort((a, b) => a.amount - b.amount);
}

if (sortBy === "date") {
  sortedExpenses.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
}
//level 11 task 74
function undoLastChange() {
  if (history.length === 0) {
    return;
  }
  const previousState = history[history.length - 1];  // Get the most recent saved state
  setExpenses(previousState);   // Restore the expenses list
  setHistory((previousHistory) =>           // Remove the restored state from history
    previousHistory.slice(0, previousHistory.length - 1)
  );
}

//level 11 task 77
function restoreHistoryState(index) {
  setExpenses(history[index]);
}

//Helper Functions
function calculateTotalExpense(expenses) {
  return expenses.reduce((total, expense) => {
    return expense.type === "Expense"
      ? total + expense.amount
      : total;
  }, 0);
}

function calculateTotalIncome(expenses) {
  return expenses.reduce((total, expense) => {
    return expense.type === "Income"
      ? total + expense.amount
      : total;
  }, 0);
}
function calculateCurrentBalance(income, expense) {
  return income - expense;
}
function getTotalExpensesCount(expenses) {
  return expenses.length;
}

function getHighestExpense(expenses) {
  const expenseTransactions = expenses.filter(
    (expense) => expense.type === "Expense"
  );
  if (expenseTransactions.length === 0) {
    return null;
  }
  return expenseTransactions.reduce((highest, expense) =>
    expense.amount > highest.amount
      ? expense
      : highest
  );
}
function getCategoryTotals(expenses) {
  return expenses.reduce((totals, expense) => {
    if (expense.type === "Expense") {
      totals[expense.category] =
        (totals[expense.category] || 0) +
        expense.amount;
    }
    return totals;
  }, {});
}
// Calculated Values 
const totalExpense = calculateTotalExpense(expenses);
const totalIncome = calculateTotalIncome(expenses);
const currentBalance = calculateCurrentBalance(
  totalIncome,
  totalExpense
);
const totalExpensesCount = getTotalExpensesCount(expenses);
const highestExpense = getHighestExpense(expenses);
const categoryTotals = getCategoryTotals(expenses);

useEffect(() => {
  document.title = `Expenses (${totalExpensesCount})`;
}, [totalExpensesCount]);

useEffect(() => {
  console.log("Selected category changed:", selectedCategory);
}, [selectedCategory]);

return (
  <div>
  <h1>Expense Tracker</h1>
  <AddExpenseForm
  onAddExpense={addExpense}
  updateExpense={updateExpense}
  isEditMode={isEditMode}
  selectedExpense={selectedExpense}
  setExpenses={setExpenses}
  setIsEditMode={setIsEditMode}
  setSelectedExpense={setSelectedExpense}
  />
    <button
    onClick={undoLastChange}
    disabled={history.length === 0}
    >
    Undo Last Change
    </button>

    <button
      onClick={() => setShowSummary(!showSummary)}
    >
      {showSummary ? "Hide Summary" : "Show Summary"}
    </button>
    {showSummary && (
      <ExpenseSummary
      totalIncome={totalIncome}
      totalExpense={totalExpense}
      currentBalance={currentBalance}
      totalExpensesCount={totalExpensesCount}
      highestExpense={highestExpense}
      categoryTotals={categoryTotals}
      />
    )}

<p>
  <strong>History Count:</strong> {history.length}
</p>
<div className="history-section">
  <h3>History</h3>
  {history.length === 0 ? (
    <p>No history available.</p>
  ) : (
    <ul>
      {history.map((state, index) => (
        <li key={index}>
          <strong>State {index + 1}</strong>
          <ul>
            {state.length === 0 ? (
              <li>No transactions</li>
            ) : (
              state.map((expense) => (
                <li key={expense.id}>
                  {expense.title} - ₹{expense.amount}
                </li>
              ))
            )}
          </ul>
          <button
            onClick={() => restoreHistoryState(index)}
          >
            Restore
          </button>
        </li>
      ))}
    </ul>
  )}
</div>

    {selectedExpense && (              //level 7
    <div className="expense-preview">
    <h3>Selected Expense</h3>
    <p><strong>Title:</strong> {selectedExpense.title}</p>
    <p><strong>Amount:</strong> ₹{selectedExpense.amount}</p>
    <p><strong>Category:</strong> {selectedExpense.category}</p>
    <p><strong>Date:</strong> {selectedExpense.date}</p>
    <p><strong>Payment Mode:</strong> {selectedExpense.paymentMode}</p>
    <p><strong>Note:</strong> {selectedExpense.note}</p>
    </div>
     )}
    
    <h3>Sort Expenses</h3>
    <button onClick={() => setSortBy("amount")}>
    Sort by Amount
    </button>
    <button onClick={() => setSortBy("date")}>
    Sort by Date
    </button>
    <button onClick={() => setSortBy("none")}>
    Clear Sorting
    </button>

     <h3>Filter by Category</h3>
    <button onClick={() => setSelectedCategory("All")}>
    All
    </button>
    <button onClick={() => setSelectedCategory("Food")}>
    Food
    </button>
    <button onClick={() => setSelectedCategory("Travel")}>
    Travel
    </button>
    <button onClick={() => setSelectedCategory("Shopping")}>
    Shopping
    </button>
    <button onClick={() => setSelectedCategory("Bills")}>
    Bills
    </button>
   <button onClick={() => setSelectedCategory("Other")}>
    Other
    </button>
    <button onClick={() => setSelectedCategory("All")}>
    Clear Filter
    </button>

    <ExpenseList
     expenses={sortedExpenses}
     onDeleteExpense={deleteExpense}
     onEditExpense={editExpense}
     onSelectExpense={selectExpense}
    />
    <StateDemo />
  </div>
);
}