import { List, Plus, Receipt } from 'lucide-react';
import ExpenseCard from './ExpenseCard.jsx';

export default function ExpenseList({
  expenses,
  onDeleteExpense,
  onEditExpense,
  onSelectExpense,
  onAddExpenseClick,
}) {
  return (
    <section className="card">
      <div className="card-head">
        <h2 className="card-title">
          <List size={16} />
          Expense List ({expenses.length})
        </h2>
        <button type="button" className="btn btn-primary btn-sm" onClick={onAddExpenseClick}>
          <Plus size={15} />
          Add Expense
        </button>
      </div>

      <div className="card-body">
        {expenses.length === 0 ? (
          <div className="empty-state">
            <Receipt size={30} strokeWidth={1.4} />
            <strong>No expenses added yet.</strong>
            <span>Add your first expense to see it listed here.</span>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="expense-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Payment Mode</th>
                  <th>Note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, index) => (
                  <ExpenseCard
                    key={expense._id}
                    index={index}
                    expense={expense}
                    onDeleteExpense={onDeleteExpense}
                    onEditExpense={onEditExpense}
                    onSelectExpense={onSelectExpense}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
