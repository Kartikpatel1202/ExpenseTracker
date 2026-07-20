const metrics = [
  { label: 'Income', value: 'Rs. 0' },
  { label: 'Expense', value: 'Rs. 0' },
  { label: 'Balance', value: 'Rs. 0' },
  { label: 'Pending Splits', value: '0' }
];
export default function DashboardPage() {
  return (
    <section>
      <header className="page-header">
        <h2>Dashboard</h2>
        <button type="button">Add Expense</button>
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

