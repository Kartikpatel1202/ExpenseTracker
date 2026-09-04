import { useState, useEffect } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import AddExpenseForm from './AddExpenseForm.jsx';
import ExpenseSummary from './ExpenseSummary.jsx';
import CategoryTotals from './CategoryTotals.jsx';
import ExpenseHistory from './ExpenseHistory.jsx';
import FiltersAndSorting from './FiltersAndSorting.jsx';
import ExpenseList from './ExpenseList.jsx';
import { formatCurrency, formatDate } from '../utils/format.js';
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
  // Controls whether the Add / Edit Expense form is shown on the page
  const [showAddForm, setShowAddForm] = useState(false);

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
// Records one entry in the change history. `snapshot` is the expense list as it
// was BEFORE the change, which is what Restore puts back.
function saveCurrentState(action, label, snapshot) {
  setHistory((previousHistory) => [
    ...previousHistory,
    {
      action,
      label,
      at: new Date(),
      expenses: snapshot,
    },
  ]);
}
  // Level 4
const addExpense = async (newExpense) => {
  // Capture the list as it looks before the change, so the history entry can
  // restore it later.
  const snapshot = expenses;
  try {
    console.log("Sending:", newExpense);
    const response = await axios.post(
      "http://localhost:5000/api/expenses",
      newExpense
    );
    console.log("POST Success:", response.data);
    // Add the newly saved expense directly to React state
    setExpenses((previousExpenses) => [
      response.data.data,
      ...previousExpenses,
    ]);

    saveCurrentState("Added", newExpense.title, snapshot);

    // Update dashboard analytics
    await fetchAnalytics();

    // Hide the form and go back to the normal Expenses page
    setShowAddForm(false);
  } catch (error) {
    console.log("Status:", error.response?.status);
    console.log("Response:", error.response?.data);
    console.log("Sent Data:", newExpense);
  }
};
const deleteExpense = async (id) => {
    const snapshot = expenses;
    const removedExpense = expenses.find((expense) => expense._id === id);
    try {
        await axios.delete(
            `http://localhost:5000/api/expenses/${id}`
        );

        saveCurrentState("Deleted", removedExpense?.title, snapshot);

        fetchExpenses();
        fetchAnalytics();
    } catch (error) {
        console.log(error);
    }
};
const updateExpense = async (updatedExpense) => {

    const snapshot = expenses;

    try {

        await axios.put(
            `http://localhost:5000/api/expenses/${updatedExpense._id}`,
            updatedExpense
        );

        saveCurrentState("Edited", updatedExpense.title, snapshot);

        fetchExpenses();
        fetchAnalytics();

        // Hide the form and go back to the normal Expenses page
        setShowAddForm(false);

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
  setShowAddForm(true);
}

// Opens / closes the Add Expense form
function toggleAddForm() {
  if (showAddForm) {
    setShowAddForm(false);
    if (isEditMode) {
      setIsEditMode(false);
      setSelectedExpense(null);
    }
  } else {
    setShowAddForm(true);
  }
}

function selectExpense(expense) {
  setSelectedExpense(expense);
}

//level 11 task 77
function restoreHistoryState(index) {
  setExpenses(history[index].expenses);
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
  <>
    <header className="page-head">
      <div>
        <h1 className="page-title">Expense Tracker</h1>
        <p className="page-subtitle">
          Track your income, expenses and manage your finances
        </p>
      </div>
    </header>

    <div className="stack">
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

      <div className={showSummary ? "grid-2" : "grid-2 grid-2--single"}>
        {showSummary && <CategoryTotals categoryTotals={categoryTotals} />}
        <ExpenseHistory history={history} onRestoreState={restoreHistoryState} />
      </div>

      <FiltersAndSorting filters={filters} setFilters={setFilters} />

      {/* level 7 - details of the row the user clicked */}
      {selectedExpense && (
        <section className="card selected-strip">
          <dl>
            <div className="selected-field">
              <dt>Selected Expense</dt>
              <dd>{selectedExpense.title}</dd>
            </div>
            <div className="selected-field">
              <dt>Amount</dt>
              <dd>{formatCurrency(selectedExpense.amount)}</dd>
            </div>
            <div className="selected-field">
              <dt>Category</dt>
              <dd>{selectedExpense.category || "—"}</dd>
            </div>
            <div className="selected-field">
              <dt>Date</dt>
              <dd>{formatDate(selectedExpense.date)}</dd>
            </div>
            <div className="selected-field">
              <dt>Payment Mode</dt>
              <dd>{selectedExpense.paymentMode || "—"}</dd>
            </div>
            <div className="selected-field">
              <dt>Note</dt>
              <dd>{selectedExpense.note || "—"}</dd>
            </div>
          </dl>
          <button
            type="button"
            className="btn-icon"
            aria-label="Clear selected expense"
            onClick={() => setSelectedExpense(null)}
          >
            <X size={16} />
          </button>
        </section>
      )}

      <ExpenseList
        expenses={expenses}
        onDeleteExpense={deleteExpense}
        onEditExpense={editExpense}
        onSelectExpense={selectExpense}
        onAddExpenseClick={toggleAddForm}
      />

      <div className="list-footer">
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => setShowSummary(!showSummary)}
        >
          {showSummary ? <EyeOff size={14} /> : <Eye size={14} />}
          {showSummary ? "Hide Summary" : "Show Summary"}
        </button>
      </div>
    </div>

    {showAddForm && (
      <AddExpenseForm
        onAddExpense={addExpense}
        updateExpense={updateExpense}
        isEditMode={isEditMode}
        selectedExpense={selectedExpense}
        setExpenses={setExpenses}
        setIsEditMode={setIsEditMode}
        setSelectedExpense={setSelectedExpense}
        onClose={toggleAddForm}
      />
    )}
  </>
);
}
