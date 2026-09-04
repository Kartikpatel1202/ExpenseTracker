import { NavLink, Outlet } from 'react-router-dom';
import { Home, ReceiptText, Users } from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', Icon: Home },
  { to: '/expenses', label: 'Expenses', Icon: ReceiptText },
  { to: '/groups', label: 'Groups', Icon: Users }
];

export default function DashboardLayout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span>Expense Tracker</span>
        </div>
        <nav>
          {links.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}>
              <Icon size={17} />
              {label}
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
