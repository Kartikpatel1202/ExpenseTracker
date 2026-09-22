import { useEffect, useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import axios from "axios";

import AddExpenseForm from "./AddExpenseForm.jsx";
import ExpenseSummary from "./ExpenseSummary.jsx";
import CategoryTotals from "./CategoryTotals.jsx";
import ExpenseHistory from "./ExpenseHistory.jsx";
import FiltersAndSorting from "./FiltersAndSorting.jsx";
import ExpenseList from "./ExpenseList.jsx";

import { formatCurrency, formatDate } from "../utils/format.js";


// ==================================================
// Authentication Helper
// ==================================================

const getAuthConfig = () => {
  const token = sessionStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};


// ==================================================
// Get Current Logged-in User
// ==================================================

const getCurrentUser = () => {
  try {
    return JSON.parse(sessionStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};


// ==================================================
// Expense Tracker
// ==================================================

export default function ExpenseTracker() {

  // ------------------------------------------------
  // Current User
  // ------------------------------------------------

  const currentUser = getCurrentUser();

  const canManage =
    currentUser?.role === "Admin" ||
    currentUser?.role === "User";


  // ------------------------------------------------
  // Expense State
  // ------------------------------------------------

  const [expenses, setExpenses] = useState([]);

  const [history, setHistory] = useState([]);

  const [selectedExpense, setSelectedExpense] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);

  const [showSummary, setShowSummary] = useState(true);


  // ------------------------------------------------
  // Analytics State
  // ------------------------------------------------

  const [analytics, setAnalytics] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    totalTransactions: 0,
    highestExpense: null,
    categoryTotals: {},
  });


  // ------------------------------------------------
  // Filters
  // ------------------------------------------------

  const [filters, setFilters] = useState({
    category: "",
    type: "",
    search: "",
    startDate: "",
    endDate: "",
    sortBy: "date",
    order: "desc",
  });


  // ==================================================
  // Fetch Expenses
  // ==================================================

  const fetchExpenses = async () => {
    try {

      const response = await axios.get(
        "http://localhost:5000/api/expenses",
        {
          params: filters,
          ...getAuthConfig(),
        }
      );

      setExpenses(response.data.data || []);

    } catch (error) {

      console.error(
        "Fetch Expenses Error:",
        error.response?.data || error
      );

    }
  };


  // ==================================================
  // Fetch Analytics
  // ==================================================

  const fetchAnalytics = async () => {
    try {

      // -------------------------------
      // Summary
      // -------------------------------

      const summaryResponse = await axios.get(
        "http://localhost:5000/api/analytics/summary",
        getAuthConfig()
      );


      // -------------------------------
      // Category-wise
      // -------------------------------

      const categoryResponse = await axios.get(
        "http://localhost:5000/api/analytics/category-wise",
        getAuthConfig()
      );


      const categoryTotals = {};

      (categoryResponse.data.data || []).forEach((item) => {
        categoryTotals[item._id] = item.totalAmount;
      });


      setAnalytics({
        ...summaryResponse.data.data,
        categoryTotals,
      });

    } catch (error) {

      console.error(
        "Analytics Error:",
        error.response?.data || error
      );

    }
  };


  // ==================================================
  // Save History
  // ==================================================

  const saveCurrentState = (
    action,
    label,
    snapshot
  ) => {

    setHistory((previousHistory) => [
      ...previousHistory,
      {
        action,
        label,
        at: new Date(),
        expenses: snapshot,
      },
    ]);

  };


  // ==================================================
  // ADD EXPENSE
  // ==================================================

  const addExpense = async (newExpense) => {

    // Viewer protection
    if (!canManage) {
      console.log("Viewer cannot add expenses.");
      return;
    }


    const previousExpenses = [...expenses];

    try {

      console.log("Sending:", newExpense);


      const response = await axios.post(
        "http://localhost:5000/api/expenses",
        newExpense,
        getAuthConfig()
      );


      console.log(
        "POST Success:",
        response.data
      );


      // Add newly created expense to UI
      setExpenses((previousExpenses) => [
        response.data.data,
        ...previousExpenses,
      ]);


      // Save history
      saveCurrentState(
        "Added",
        newExpense.title,
        previousExpenses
      );


      // Refresh analytics
      await fetchAnalytics();


      // Close modal
      setShowAddForm(false);

    } catch (error) {

      console.error(
        "Add Expense Error:",
        error.response?.data || error
      );

    }
  };


  // ==================================================
  // UPDATE EXPENSE
  // ==================================================

  const updateExpense = async (updatedExpense) => {

    // Viewer protection
    if (!canManage) {
      console.log("Viewer cannot update expenses.");
      return;
    }


    const previousExpenses = [...expenses];

    try {

      await axios.put(
        `http://localhost:5000/api/expenses/${updatedExpense._id}`,
        {
          title: updatedExpense.title,
          amount: Number(updatedExpense.amount),
          type: updatedExpense.type,
          category: updatedExpense.category,
          date: updatedExpense.date,
          paymentMode: updatedExpense.paymentMode,
          note: updatedExpense.note,
        },
        getAuthConfig()
      );


      saveCurrentState(
        "Edited",
        updatedExpense.title,
        previousExpenses
      );


      await fetchExpenses();

      await fetchAnalytics();


      setIsEditMode(false);

      setSelectedExpense(null);

      setShowAddForm(false);

    } catch (error) {

      console.error(
        "Update Expense Error:",
        error.response?.data || error
      );

    }
  };


  // ==================================================
  // DELETE EXPENSE
  // ==================================================

  const deleteExpense = async (id) => {

    // Viewer protection
    if (!canManage) {
      console.log("Viewer cannot delete expenses.");
      return;
    }


    const previousExpenses = [...expenses];

    const deletedExpense = expenses.find(
      (expense) => expense._id === id
    );


    try {

      await axios.delete(
        `http://localhost:5000/api/expenses/${id}`,
        getAuthConfig()
      );


      saveCurrentState(
        "Deleted",
        deletedExpense?.title || "Expense",
        previousExpenses
      );


      await fetchExpenses();

      await fetchAnalytics();

    } catch (error) {

      console.error(
        "Delete Expense Error:",
        error.response?.data || error
      );

    }
  };


  // ==================================================
  // EDIT EXPENSE
  // ==================================================

  const editExpense = (expense) => {

    // Viewer cannot edit
    if (!canManage) {
      return;
    }


    setSelectedExpense(expense);

    setIsEditMode(true);

    setShowAddForm(true);
  };


  // ==================================================
  // SELECT EXPENSE
  // ==================================================

  const selectExpense = (expense) => {

    setSelectedExpense(expense);

  };


  // ==================================================
  // ADD FORM TOGGLE
  // ==================================================

  const toggleAddForm = () => {

    // Viewer cannot open form
    if (!canManage) {
      return;
    }


    if (showAddForm) {

      setShowAddForm(false);

      setIsEditMode(false);

      setSelectedExpense(null);

    } else {

      setShowAddForm(true);

      setIsEditMode(false);

      setSelectedExpense(null);

    }
  };


  // ==================================================
  // RESTORE HISTORY
  // ==================================================

  const restoreHistoryState = (index) => {

    const selectedHistory = history[index];

    if (!selectedHistory) {
      return;
    }

    setExpenses(selectedHistory.expenses);

  };


  // ==================================================
  // Fetch Data on Load / Filter Change
  // ==================================================

  useEffect(() => {

    fetchExpenses();

    fetchAnalytics();

  }, [filters]);


  // ==================================================
  // Document Title
  // ==================================================

  useEffect(() => {

    document.title = `Expenses (${analytics.totalTransactions})`;

  }, [analytics.totalTransactions]);


  // ==================================================
  // Render
  // ==================================================

  return (
    <>
      {/* ============================================
          PAGE HEADER
      ============================================ */}

      <header className="page-head">

        <div>

          <h1 className="page-title">
            Expense Tracker
          </h1>

          <p className="page-subtitle">
            Track your income, expenses and manage your finances
          </p>

        </div>

      </header>


      <div className="stack">


        {/* ==========================================
            FINANCIAL SUMMARY
        ========================================== */}

        {showSummary && (

          <ExpenseSummary
            totalIncome={analytics.totalIncome}
            totalExpense={analytics.totalExpense}
            currentBalance={analytics.balance}
            totalExpensesCount={
              analytics.totalTransactions
            }
            highestExpense={
              analytics.highestExpense
            }
            categoryTotals={
              analytics.categoryTotals
            }
          />

        )}


        {/* ==========================================
            CATEGORY + HISTORY
        ========================================== */}

        <div className="grid-2">

          {showSummary && (

            <CategoryTotals
              categoryTotals={
                analytics.categoryTotals
              }
            />

          )}


          <ExpenseHistory
            history={history}
            onRestoreState={
              restoreHistoryState
            }
          />

        </div>


        {/* ==========================================
            FILTERS
        ========================================== */}

        <FiltersAndSorting
          filters={filters}
          setFilters={setFilters}
        />


        {/* ==========================================
            SELECTED EXPENSE
        ========================================== */}

        {selectedExpense && (

          <section className="card selected-strip">

            <dl>

              <div className="selected-field">

                <dt>Selected Expense</dt>

                <dd>
                  {selectedExpense.title}
                </dd>

              </div>


              <div className="selected-field">

                <dt>Amount</dt>

                <dd>
                  {formatCurrency(
                    selectedExpense.amount
                  )}
                </dd>

              </div>


              <div className="selected-field">

                <dt>Category</dt>

                <dd>
                  {selectedExpense.category || "—"}
                </dd>

              </div>


              <div className="selected-field">

                <dt>Date</dt>

                <dd>
                  {formatDate(
                    selectedExpense.date
                  )}
                </dd>

              </div>


              <div className="selected-field">

                <dt>Payment Mode</dt>

                <dd>
                  {selectedExpense.paymentMode || "—"}
                </dd>

              </div>


              <div className="selected-field">

                <dt>Note</dt>

                <dd>
                  {selectedExpense.note || "—"}
                </dd>

              </div>

            </dl>


            <button
              type="button"
              className="btn-icon"
              aria-label="Clear selected expense"
              onClick={() =>
                setSelectedExpense(null)
              }
            >

              <X size={16} />

            </button>

          </section>

        )}


        {/* ==========================================
            EXPENSE LIST
        ========================================== */}

        <ExpenseList
          expenses={expenses}
          onDeleteExpense={deleteExpense}
          onEditExpense={editExpense}
          onSelectExpense={selectExpense}
          onAddExpenseClick={toggleAddForm}
          canManage={canManage}
        />


        {/* ==========================================
            SHOW / HIDE SUMMARY
        ========================================== */}

        <div className="list-footer">

          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() =>
              setShowSummary(!showSummary)
            }
          >

            {showSummary ? (
              <EyeOff size={14} />
            ) : (
              <Eye size={14} />
            )}

            {showSummary
              ? "Hide Summary"
              : "Show Summary"}

          </button>

        </div>

      </div>


      {/* ============================================
          ADD / EDIT FORM
      ============================================ */}

      {showAddForm && canManage && (

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