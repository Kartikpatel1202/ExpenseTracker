import { Clock, FileText, RotateCcw } from "lucide-react";

const ACTION_VARIANT = {
  Added: "added",
  Edited: "edited",
  Deleted: "deleted",
};

function formatTime(value) {
  const parsedDate = value instanceof Date ? value : new Date(value);
  if (isNaN(parsedDate)) {
    return "";
  }
  return parsedDate.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ExpenseHistory({ history, onRestoreState }) {
  return (
    <section className="card">
      <div className="card-head">
        <h3 className="card-title">
          <Clock size={16} />
          Expense History
        </h3>
        <p className="card-meta">Count: {history.length}</p>
      </div>

      <div className="card-body">
        {history.length === 0 ? (
          <div className="empty-state">
            <FileText size={30} strokeWidth={1.4} />
            <strong>No history available.</strong>
            <span>Your expense history will appear here.</span>
          </div>
        ) : (
          <div className="history-list">
            {history
              .map((entry, index) => ({ entry, index }))
              .reverse() // newest change first, without losing the real index
              .map(({ entry, index }) => (
                <article className="history-item" key={index}>
                  <span
                    className={`history-badge history-badge--${
                      ACTION_VARIANT[entry.action] || "edited"
                    }`}
                  >
                    {entry.action}
                  </span>

                  <div className="history-item-body">
                    <p className="history-item-title">{entry.label || "Untitled expense"}</p>
                    <p className="history-item-meta">
                      {formatTime(entry.at)} · restores {entry.expenses.length}{" "}
                      {entry.expenses.length === 1 ? "entry" : "entries"}
                    </p>
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    onClick={() => onRestoreState(index)}
                  >
                    <RotateCcw size={13} />
                    Restore
                  </button>
                </article>
              ))}
          </div>
        )}
      </div>
    </section>
  );
}
