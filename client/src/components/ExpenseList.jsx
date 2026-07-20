import ExpenseCard from './ExpenseCard.jsx';
export default function ExpenseList({ expenses , deleteExpense ,  editExpense }) {
  return (
    <div>
      {expenses.length === 0 && (
        <p>No expenses added yet.</p>
      )}
      {expenses.length > 0 && (
        <>
          <h2>Expense List</h2>
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              deleteExpense={deleteExpense}
              editExpense={editExpense}
            />
          ))}
        </>
      )}

    </div>
  );
}