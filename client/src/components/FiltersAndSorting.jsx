import { ArrowDownWideNarrow, CalendarDays, SlidersHorizontal, X } from "lucide-react";

const categories = ["All", "Food", "Travel", "Shopping", "Bills", "Other"];

export default function FiltersAndSorting({ filters, setFilters }) {
  function applySort(sortBy, order) {
    setFilters({ ...filters, sortBy, order });
  }

  function applyCategory(category) {
    setFilters({ ...filters, category });
  }

  return (
    <section className="card">
      <div className="card-head">
        <h3 className="card-title">
          <SlidersHorizontal size={16} />
          Filters &amp; Sorting
        </h3>
      </div>

      <div className="card-body">
        <div className="filters-body">
          <div>
            <p className="filter-group-label">Sort Expenses</p>
            <div className="chip-row">
              <button
                type="button"
                className={`chip${filters.sortBy === "amount" ? " is-active" : ""}`}
                onClick={() => applySort("amount", "asc")}
              >
                <ArrowDownWideNarrow size={14} />
                Sort by Amount
              </button>
              <button
                type="button"
                className={`chip${filters.sortBy === "date" ? " is-active" : ""}`}
                onClick={() => applySort("date", "desc")}
              >
                <CalendarDays size={14} />
                Sort by Date
              </button>
              <button
                type="button"
                className="chip"
                onClick={() => applySort("", "desc")}
              >
                <X size={14} />
                Clear Sorting
              </button>
            </div>
          </div>

          <div className="filters-divider" aria-hidden="true" />

          <div>
            <p className="filter-group-label">Filter by Category</p>
            <div className="chip-row">
              {categories.map((label) => {
                const value = label === "All" ? "" : label;
                return (
                  <button
                    type="button"
                    key={label}
                    className={`chip${filters.category === value ? " is-active" : ""}`}
                    onClick={() => applyCategory(value)}
                  >
                    {label}
                  </button>
                );
              })}
              <button
                type="button"
                className="chip"
                onClick={() => applyCategory("")}
              >
                <X size={14} />
                Clear Filter
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
