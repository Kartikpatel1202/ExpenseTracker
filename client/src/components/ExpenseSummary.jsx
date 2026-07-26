function ExpenseSummary({
  totalIncome,
  totalExpense,
  currentBalance,
  totalExpensesCount,
  highestExpense,
  categoryTotals,
}) {
  return (
    <div className="financial-summary">
      <h3>Financial Summary</h3>
      <p>Total Income: ₹{totalIncome}</p>
      <p>Total Expense: ₹{totalExpense}</p>
      <p>Current Balance: ₹{currentBalance}</p>
      <p>Total Transactions: {totalExpensesCount}</p>
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
    </div>
  );
}
export default ExpenseSummary;