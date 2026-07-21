export default function ExpenseCard({ expense ,  onDeleteExpense , onEditExpense , onSelectExpense}) {
  let badge = "";
  if (expense.category === "Food") {
    badge = "🍔 Food";
  } else if (expense.category === "Travel") {
    badge = "🚌 Travel";
  } else if (expense.category === "Entertainment") {
    badge = "🎬 Entertainment";
  } else if (expense.category === "Shopping") {
    badge = "🛒 Shopping";
  } else if (expense.category === "Health") {
    badge = "💊 Health";
  } else if (expense.category === "Education") {
    badge = "📚 Education";
  } else {
    badge = "📂 Other";
  }
  return (
    <div
      className="expense-card"
      onClick={() => onSelectExpense(expense)}
    >
      <h3>{expense.title}</h3>

      <span className="category-badge">
        {badge}
      </span>

      <p>Amount: Rs. {expense.amount}</p>
      <p>Date: {expense.date}</p>
      <p>Payment Mode: {expense.paymentMode}</p>
      <p>Note: {expense.note}</p>

      <button
      onClick={(event) => {
      event.stopPropagation();    // Prevents the button click from triggering the parent card's onClick event.
      onDeleteExpense(expense.id);
      }}
      >
      Delete
      </button>

    <button
    onClick={(event) => {
    event.stopPropagation();    // Prevents the button click from triggering the parent card's onClick event.
    onEditExpense(expense);
    }}
    >
     Edit
    </button>
    </div>
  );
}
