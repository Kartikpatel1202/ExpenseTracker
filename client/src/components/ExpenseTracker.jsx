import { useState, useEffect } from 'react';
import AddExpenseForm from './AddExpenseForm.jsx';
import ExpenseSummary from './ExpenseSummary.jsx';
import ExpenseList from './ExpenseList.jsx';
import StateDemo from './StateDemo.jsx';
import ExpenseTotals from "./ExpenseTotals";
import axios from "axios";

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  const [history, setHistory] = useState([]);
  console.log("History:", history);
  console.log("ExpenseTracker Rendered");
  console.log("Current expenses:", expenses);
  const [showSummary, setShowSummary] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [analytics, setAnalytics] = useState({
  totalIncome: 0,
  totalExpense: 0,
  balance: 0,
  totalTransactions: 0,
  highestExpense: null,
  categoryTotals: {},
});

  const [filters, setFilters] = useState({
  category: "",
  type: "",
  search: "",
  startDate: "",
  endDate: "",
  sortBy: "date",
  order: "desc",
});

const fetchExpenses = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/api/expenses",
      {
        params: filters,
      }
    );
    setExpenses(response.data.data);
  } catch (error) {
    console.log(error);
  }
};


// level 11 task 73
function saveCurrentState() {
  setHistory((previousHistory) => [
    ...previousHistory,
    expenses,
  ]);
}
  // Level 4
const addExpense = async (newExpense) => {
    try {
        console.log("Sending:", newExpense);
        const response = await axios.post(
            "http://localhost:5000/api/expenses",
            newExpense
        );
        console.log("Success:", response.data);
        fetchExpenses();
    } catch (error) {
        console.log("Status:", error.response?.status);
        console.log("Response:", error.response?.data);
        console.log("Sent Data:", newExpense);
    }
};
const deleteExpense = async (id) => {
    try {
        await axios.delete(
            `http://localhost:5000/api/expenses/${id}`
        );
        fetchExpenses();
    } catch (error) {
        console.log(error);
    }
};
const updateExpense = async (updatedExpense) => {

    try {

        await axios.put(
            `http://localhost:5000/api/expenses/${updatedExpense._id}`,
            updatedExpense
        );

        fetchExpenses();

    } catch (error) {

        console.log(error);

    }

};
const fetchAnalytics = async () => {
  try {
    const summaryResponse = await axios.get(
      "http://localhost:5000/api/analytics/summary"
    );

    const categoryResponse = await axios.get(
      "http://localhost:5000/api/analytics/category-wise"
    );

    const categoryTotals = {};

    categoryResponse.data.data.forEach((item) => {
      categoryTotals[item._id] = item.totalAmount;
    });

    setAnalytics({
      ...summaryResponse.data.data,
      categoryTotals,
    });

  } catch (error) {
    console.log(error);
  }
};

function editExpense(expense) {
  setSelectedExpense(expense);
  setIsEditMode(true);
}

function selectExpense(expense) {
  setSelectedExpense(expense);
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
const totalIncome = analytics.totalIncome;
const totalExpense = analytics.totalExpense;
const currentBalance = analytics.balance;
const totalExpensesCount = analytics.totalTransactions;
const highestExpense = analytics.highestExpense;
const categoryTotals = analytics.categoryTotals;

useEffect(() => {
  document.title = `Expenses (${totalExpensesCount})`;
}, [totalExpensesCount]);


useEffect(() => {
    fetchExpenses();
    fetchAnalytics();
}, [filters]);

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
                <li key={expense._id}>
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
<button
  onClick={() =>
    setFilters({
      ...filters,
      sortBy: "amount",
      order: "asc",
    })
  }
>
  Sort by Amount
</button>
<button
  onClick={() =>
    setFilters({
      ...filters,
      sortBy: "date",
      order: "desc",
    })
  }
>
  Sort by Date
</button>
<button
  onClick={() =>
    setFilters({
      ...filters,
      sortBy: "",
      order: "desc",
    })
  }
>
  Clear Sorting
</button>

<h3>Filter by Category</h3>

<button
  onClick={() =>
    setFilters({
      ...filters,
      category: "",
    })
  }
>
  All
</button>

<button
  onClick={() =>
    setFilters({
      ...filters,
      category: "Food",
    })
  }
>
  Food
</button>

<button
  onClick={() =>
    setFilters({
      ...filters,
      category: "Travel",
    })
  }
>
  Travel
</button>

<button
  onClick={() =>
    setFilters({
      ...filters,
      category: "Shopping",
    })
  }
>
  Shopping
</button>

<button
  onClick={() =>
    setFilters({
      ...filters,
      category: "Bills",
    })
  }
>
  Bills
</button>

<button
  onClick={() =>
    setFilters({
      ...filters,
      category: "Other",
    })
  }
>
  Other
</button>

<button
  onClick={() =>
    setFilters({
      ...filters,
      category: "",
    })
  }
>
  Clear Filter
</button>

<ExpenseList
  expenses={expenses}
  onDeleteExpense={deleteExpense}
  onEditExpense={editExpense}
  onSelectExpense={selectExpense}
/>
    <StateDemo />
  </div>
);
}