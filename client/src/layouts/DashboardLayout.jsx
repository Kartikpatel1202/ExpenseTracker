import { NavLink, Outlet } from 'react-router-dom';
const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/expenses', label: 'Expenses' },
  { to: '/groups', label: 'Groups' }
];
export default function DashboardLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h1>Expense Tracker</h1>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

