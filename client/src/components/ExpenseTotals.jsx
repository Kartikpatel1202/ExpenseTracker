function ExpenseTotals({
  totalIncome,
  totalExpense,
  currentBalance,
  totalExpensesCount,
  highestExpense,
}) {
  return (
    <div className="expense-totals">
      <h2>Expense Totals</h2>
      <p>
        <strong>Total Income:</strong> ₹{totalIncome}
      </p>
      <p>
        <strong>Total Expense:</strong> ₹{totalExpense}
      </p>
      <p>
        <strong>Current Balance:</strong> ₹{currentBalance}
      </p>
      <p>
        <strong>Total Transactions:</strong>{" "}
        {totalExpensesCount}
      </p>
      <p>
        <strong>Highest Expense:</strong>{" "}
        {highestExpense
          ? `${highestExpense.title} - ₹${highestExpense.amount}`
          : "None"}
      </p>
    </div>
  );
}
export default ExpenseTotals;