import { PieChart, Tags } from "lucide-react";
import { getCategoryMeta } from "../utils/categoryMeta.js";
import { formatCurrency } from "../utils/format.js";

export default function CategoryTotals({ categoryTotals }) {
  const entries = Object.entries(categoryTotals || {});

  return (
    <section className="card">
      <div className="card-head">
        <h3 className="card-title">
          <PieChart size={16} />
          Category-wise Totals
        </h3>
      </div>

      <div className="card-body">
        {entries.length === 0 ? (
          <div className="empty-state">
            <Tags size={30} strokeWidth={1.4} />
            <strong>No categories yet.</strong>
            <span>Category totals appear once you add expenses.</span>
          </div>
        ) : (
          <div className="category-grid">
            {entries.map(([category, total]) => {
              const { Icon, color, tint, line } = getCategoryMeta(category);
              return (
                <article
                  className="category-tile"
                  key={category}
                  style={{ background: tint, borderColor: line }}
                >
                  <div className="category-tile-head">
                    <Icon size={15} color={color} />
                    <span className="category-tile-name">{category}</span>
                  </div>
                  <p className="category-tile-amount">{formatCurrency(total)}</p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
