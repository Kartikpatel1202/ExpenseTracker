import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  Wallet,
} from "lucide-react";
import SummaryCard from "./SummaryCard.jsx";
import { formatCurrency } from "../utils/format.js";

function ExpenseSummary({
  totalIncome,
  totalExpense,
  currentBalance,
  totalExpensesCount,
  highestExpense,
}) {
  return (
    <section className="card financial-summary">
      <div className="card-head">
        <h3 className="card-title">Financial Summary</h3>
        <p className="card-meta">
          <CalendarDays size={15} />
          Total Transactions: {totalExpensesCount}
        </p>
      </div>

      <div className="card-body">
        <div className="summary-grid">
          <SummaryCard variant="income" Icon={ArrowUpRight} label="Total Income">
            <p className="summary-value">{formatCurrency(totalIncome)}</p>
          </SummaryCard>

          <SummaryCard variant="expense" Icon={ArrowDownRight} label="Total Expense">
            <p className="summary-value">{formatCurrency(totalExpense)}</p>
          </SummaryCard>

          <SummaryCard variant="balance" Icon={Wallet} label="Current Balance">
            <p
              className={
                currentBalance < 0 ? "summary-value is-negative" : "summary-value"
              }
            >
              {formatCurrency(currentBalance)}
            </p>
          </SummaryCard>

          <SummaryCard variant="highest" Icon={BarChart3} label="Highest Expense">
            {highestExpense ? (
              <>
                <p className="summary-sub-title">{highestExpense.title}</p>
                <p className="summary-sub-value">
                  {formatCurrency(highestExpense.amount)}
                </p>
              </>
            ) : (
              <p className="summary-sub-title">No Expense</p>
            )}
          </SummaryCard>
        </div>
      </div>
    </section>
  );
}

export default ExpenseSummary;
