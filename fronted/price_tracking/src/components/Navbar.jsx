import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Navbar() {
  // ---------------------------
  // Auth Context
  // ---------------------------
  // Provides user info and logout function
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  console.log("user ==> ", user)

  // ---------------------------
  // NavLink Styling Helper
  // ---------------------------
  // Dynamically sets classes based on active route
  const navLinkClass = ({ isActive }) =>
    `rounded-xl px-3 py-2 text-sm ${
      isActive
        ? "bg-gray-900 text-white font-semibold"  // Active link style
        : "hover:bg-gray-100 text-gray-700"       // Inactive hover style
    }`;

  // ---------------------------
  // Navbar JSX
  // ---------------------------
  return (
    <nav className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

        {/* Logo / Home Link */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-black tracking-tight">PriceTracker</span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-3">

          {/* Always show Home */}
          <NavLink to="/" className={navLinkClass} end>
            Home
          </NavLink>

          {!user ? (
            // ---------------------------
            // User Not Logged In
            // ---------------------------
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <NavLink to="/signup" className={navLinkClass}>
                Sign up
              </NavLink>
            </>
          ) : (
            // ---------------------------
            // User Logged In
            // ---------------------------
            <>
              <NavLink to="/my-tracked" className={navLinkClass}>
                My Tracked
              </NavLink>

              {/* ✅ Admin Link (only if user is admin) */}
              {/* {localStorage.getItem("is_admin") === "true" && (
                <NavLink to="/admin/dashboard" className={navLinkClass}>
                  Admin
                </NavLink>
              )} */}
              {user?.is_admin && (
                <NavLink to="/admin/dashboard" className={navLinkClass}>
                  Admin
                </NavLink>
              )}

              {/* Greeting */}
              <span className="text-sm text-gray-600 ml-2">
                Hi, {user.username || user.email}
              </span>

              {/* Logout Button */}
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="ml-3 rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}


