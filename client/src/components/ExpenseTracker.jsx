import { useState } from 'react';
import AddExpenseForm from './AddExpenseForm.jsx';
import ExpenseSummary from './ExpenseSummary.jsx';
import ExpenseList from './ExpenseList.jsx';
import StateDemo from './StateDemo.jsx';

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState([]);
  //   {
  //     id: 1,
  //     title: 'Lunch',
  //     amount: 250,
  //     category: 'Food',
  //     date: '2026-07-10',
  //     paymentMode: 'UPI',
  //     note: 'Lunch with friends'
  //   },
  //   {
  //     id: 2,
  //     title: 'Bus Ticket',
  //     amount: 100,
  //     category: 'Travel',
  //     date: '2026-07-11',
  //     paymentMode: 'Cash',
  //     note: 'College travel'
  //   },
  //   {
  //     id: 3,
  //     title: 'Movie Ticket',
  //     amount: 300,
  //     category: 'Entertainment',
  //     date: '2026-07-12',
  //     paymentMode: 'Card',
  //     note: 'Weekend movie'
  //   }
  // ]);
  const [showSummary, setShowSummary] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

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
return (
  <div>
    <h1>Expense Tracker</h1>
  <AddExpenseForm
  addExpense={addExpense}
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
    <ExpenseList
     expenses={expenses}
     deleteExpense={deleteExpense}
     editExpense={editExpense}
    />
    <StateDemo />
  </div>
);
}