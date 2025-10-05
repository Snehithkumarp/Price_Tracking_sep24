// src/components/AdminLayout.js
import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  const navLinkClass = ({ isActive }) =>
    `rounded-xl px-3 py-2 text-sm ${
      isActive
        ? "bg-gray-900 text-white font-semibold"
        : "hover:bg-gray-100 text-gray-700"
    }`;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-4 sticky top-0 h-screen">
        <nav className="flex flex-col gap-4">
          <NavLink to="/admin/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={navLinkClass}>
            Products
          </NavLink>
          <NavLink to="/admin/tracked" className={navLinkClass}>
            Tracked Products
          </NavLink>
          <NavLink to="/admin/price-history" className={navLinkClass}>
            Price History
          </NavLink>
          {/* Uncomment when Users page is ready */}
          <NavLink to="/admin/users" className={navLinkClass}>
            Users
          </NavLink>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
