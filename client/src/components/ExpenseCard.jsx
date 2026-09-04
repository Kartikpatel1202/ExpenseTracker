import { Pencil, Trash2 } from "lucide-react";
import { getCategoryMeta } from "../utils/categoryMeta.js";
import { formatCurrency, formatDate } from "../utils/format.js";

export default function ExpenseCard({
  index,
  expense,
  onDeleteExpense,
  onEditExpense,
  onSelectExpense,
}) {
  const { Icon, color } = getCategoryMeta(expense.category);

  return (
    <tr className="expense-card" onClick={() => onSelectExpense(expense)}>
      <td className="cell-index">{index + 1}</td>

      <td className="cell-title">{expense.title}</td>

      <td>
        <span className="category-badge">
          <Icon size={15} color={color} />
          {expense.category || "Other"}
        </span>
      </td>

      <td>
        <span className="type-pill">{expense.type}</span>
      </td>

      <td className="cell-amount">{formatCurrency(expense.amount)}</td>

      <td className="cell-muted">{formatDate(expense.date)}</td>

      <td className="cell-muted">{expense.paymentMode || "—"}</td>

      <td className="cell-muted">{expense.note || "—"}</td>

      <td>
        <div className="expense-actions">
          <button
            type="button"
            className="btn btn-primary btn-xs"
            onClick={(event) => {
              event.stopPropagation(); // Prevents the button click from triggering the parent card's onClick event.
              onEditExpense(expense);
            }}
          >
            <Pencil size={12} />
            Edit
          </button>

          <button
            type="button"
            className="btn btn-danger btn-xs"
            onClick={(event) => {
              event.stopPropagation(); // Prevents the button click from triggering the parent card's onClick event.
              onDeleteExpense(expense._id);
            }}
          >
            <Trash2 size={12} />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
