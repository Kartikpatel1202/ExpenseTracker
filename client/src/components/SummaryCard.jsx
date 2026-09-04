export default function SummaryCard({ variant, Icon, label, children }) {
  return (
    <article className={`summary-card summary-card--${variant}`}>
      <div className="icon-badge">
        <Icon size={18} />
      </div>
      <div className="summary-card-body">
        <p className="summary-label">{label}</p>
        {children}
      </div>
    </article>
  );
}
