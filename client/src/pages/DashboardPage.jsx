const metrics = [
  { label: 'Income', value: 'Rs. 0' },
  { label: 'Expense', value: 'Rs. 0' },
  { label: 'Balance', value: 'Rs. 0' },
  { label: 'Pending Splits', value: '0' }
];
export default function DashboardPage() {
  return (
    <section>
      <header className="page-head">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">An overview of your finances at a glance</p>
        </div>
        <button type="button" className="btn btn-primary btn-sm">Add Expense</button>
      </header>
      <div className="metric-grid">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
