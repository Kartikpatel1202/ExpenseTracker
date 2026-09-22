import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Home,
  ReceiptText,
  Users,
  LogOut,
  MessageCircle,
} from "lucide-react"; 
import { useEffect } from "react";
import {
  createSocket,
  disconnectSocket,
} from "../socket/socket";

const links = [
  { to: "/", label: "Dashboard", Icon: Home },
  { to: "/expenses", label: "Expenses", Icon: ReceiptText },
  { to: "/users", label: "Users", Icon: Users },
  { to: "/groups", label: "Groups", Icon: Users },
  { to: "/chat", label: "Chat", Icon: MessageCircle },
];

export default function DashboardLayout() {
  const navigate = useNavigate();

useEffect(() => {
  const socket = createSocket();

  if (!socket) {
    return;
  }

  const handleConnect = () => {
    console.log("Socket connected:", socket.id);
  };

  const handleConnectError = (error) => {
    console.error(
      "Socket connection error:",
      error.message
    );
  };

  socket.on("connect", handleConnect);
  socket.on("connect_error", handleConnectError);

  return () => {
    socket.off("connect", handleConnect);
    socket.off("connect_error", handleConnectError);
  };
}, []);

  // Logout
const handleLogout = () => {
  disconnectSocket();
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  navigate("/login", { replace: true });
};

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span>Expense Tracker</span>
        </div>

        <nav>
          {links.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <LogOut size={17} />
          Logout
        </button>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}