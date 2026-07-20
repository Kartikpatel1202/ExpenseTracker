export default function ExpenseSummary({ expenses }) {
  const totalAmount = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );
  return (
    <div>
      <h2>Expense Summary</h2>
      <p>Total Expenses: Rs. {totalAmount}</p>
      <p>Number of Expenses: {expenses.length}</p>
    </div>
  );
}