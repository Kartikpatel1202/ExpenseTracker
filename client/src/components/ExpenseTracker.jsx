import { useState } from 'react';
import AddExpenseForm from './AddExpenseForm.jsx';
import ExpenseSummary from './ExpenseSummary.jsx';
import ExpenseList from './ExpenseList.jsx';
import StateDemo from './StateDemo.jsx';

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [showSummary, setShowSummary] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sortBy, setSortBy] = useState("none");

  // Level 4
  function addExpense(newExpense) {
  console.log("New Expense:", newExpense);
  setExpenses((previousExpenses) => [
    ...previousExpenses,
    newExpense
  ]);
}
function deleteExpense(id) {
  setExpenses((prevExpenses) =>
    prevExpenses.filter((expense) => expense.id !== id)
  );
}
function updateExpense(updatedExpense) {
  setExpenses((prevExpenses) =>
    prevExpenses.map((expense) =>
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

const totalExpense = expenses.reduce((total, expense) => {
  return expense.type === "Expense"
    ? total + expense.amount
    : total;
}, 0);

const totalIncome = expenses.reduce((total, expense) => {
  return expense.type === "Income"
    ? total + expense.amount
    : total;
}, 0);

const currentBalance = totalIncome - totalExpense;
const totalExpensesCount = expenses.length;
const expenseTransactions = expenses.filter(
  (expense) => expense.type === "Expense"
);
const highestExpense =
  expenseTransactions.length > 0
    ? expenseTransactions.reduce((max, expense) =>
        expense.amount > max.amount ? expense : max
)
: null;

const categoryTotals = expenses.reduce((totals, expense) => {
  if (expense.type === "Expense") {
    totals[expense.category] =
      (totals[expense.category] || 0) + expense.amount;
  }
  return totals;
}, {});

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
      onClick={() => setShowSummary(!showSummary)}
    >
      {showSummary ? "Hide Summary" : "Show Summary"}
    </button>
    {showSummary && (
      <ExpenseSummary expenses={expenses} />
    )}
     
    <div className="financial-summary">
    <h3>Financial Summary</h3>
     <p>Total Income: ₹{totalIncome}</p>
     <p>Total Expense: ₹{totalExpense}</p>
     <p>Current Balance: ₹{currentBalance}</p>
    </div>
    <p>Total Number of Expenses: {totalExpensesCount}</p>
    <p>
    Highest Expense:
    {highestExpense
    ? ` ${highestExpense.title} - ₹${highestExpense.amount}`
    : " No Expense"}
    </p>
    
    <h3>Category-wise Totals</h3>
    <ul>
    {Object.entries(categoryTotals).map(([category, total]) => (
    <li key={category}>
      {category}: ₹{total}
    </li>
    ))}
    </ul>

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