// import { NavLink, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";
// import { Link } from "react-router-dom";

// export default function Navbar() {
//   // ---------------------------
//   // Auth Context
//   // ---------------------------
//   // Provides user info and logout function
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();
//   console.log("user ==> ", user)

//   // ---------------------------
//   // NavLink Styling Helper
//   // ---------------------------
//   // Dynamically sets classes based on active route
//   const navLinkClass = ({ isActive }) =>
//     `rounded-xl px-3 py-2 text-sm ${
//       isActive
//         ? "bg-gray-900 text-white font-semibold"  // Active link style
//         : "hover:bg-gray-100 text-gray-700"       // Inactive hover style
//     }`;

//   // ---------------------------
//   // Navbar JSX
//   // ---------------------------
//   return (
//     <nav className="sticky top-0 z-40 border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/50">
//       <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

//         {/* Logo / Home Link */}
//         <Link to="/" className="flex items-center gap-2">
//           <span className="text-xl font-black tracking-tight">PriceTracker</span>
//         </Link>

//         {/* Navigation Links */}
//         <div className="flex items-center gap-3">

//           {/* Always show Home */}
//           <NavLink to="/" className={navLinkClass} end>
//             Home
//           </NavLink>

//           {!user ? (
//             // ---------------------------
//             // User Not Logged In
//             // ---------------------------
//             <>
//               <NavLink to="/login" className={navLinkClass}>
//                 Login
//               </NavLink>
//               <NavLink to="/signup" className={navLinkClass}>
//                 Sign up
//               </NavLink>
//             </>
//           ) : (
//             // ---------------------------
//             // User Logged In
//             // ---------------------------
//             <>
//               <NavLink to="/my-tracked" className={navLinkClass}>
//                 My Tracked
//               </NavLink>

//               {/* ✅ Admin Link (only if user is admin) */}
//               {/* {localStorage.getItem("is_admin") === "true" && (
//                 <NavLink to="/admin/dashboard" className={navLinkClass}>
//                   Admin
//                 </NavLink>
//               )} */}
//               {user?.is_admin && (
//                 <NavLink to="/admin/dashboard" className={navLinkClass}>
//                   Admin
//                 </NavLink>
//               )}

//               {/* Greeting */}
//               <span className="text-sm text-gray-600 ml-2">
//                 Hi, {user.username || user.email}
//               </span>

//               {/* Logout Button */}
//               <button
//                 onClick={() => {
//                   logout();
//                   navigate("/login");
//                 }}
//                 className="ml-3 rounded-xl bg-gray-900 px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800"
//               >
//                 Logout
//               </button>
//             </>
//           )}
//         </div>
//       </div>
//     </nav>
//   );
// }


// ------------------------------------
// Theme 02
// ------------------------------------

import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Navbar() {
  // ---------------------------
  // Auth Context & State
  // ---------------------------
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  console.log("Navbar user:", user);

  // ---------------------------
  // NavLink Styling Helper
  // ---------------------------
  const navLinkClass = ({ isActive }) =>
    `rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "bg-gray-900 text-white shadow-sm"  // Active link style
        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900" // Inactive hover style
    }`;

  // ---------------------------
  // Mobile NavLink Styling Helper
  // ---------------------------
  const mobileNavLinkClass = ({ isActive }) =>
    `block rounded-lg px-3 py-2 text-base font-medium transition-colors duration-200 ${
      isActive
        ? "bg-gray-900 text-white"  // Active link style
        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900" // Inactive hover style
    }`;

  // ---------------------------
  // Handle Logout
  // ---------------------------
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
      setIsMobileMenuOpen(false); // Close mobile menu on logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // ---------------------------
  // Close mobile menu when route changes
  // ---------------------------
  const handleNavClick = () => {
    setIsMobileMenuOpen(false); // Fixed: changed from setIsMobileMenu to setIsMobileMenuOpen
  };

  // ---------------------------
  // Toggle mobile menu
  // ---------------------------
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // ---------------------------
  // Close mobile menu
  // ---------------------------
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // ---------------------------
  // User display name
  // ---------------------------
  const getUserDisplayName = () => {
    return user?.username || user?.email?.split('@')[0] || 'User';
  };

  // ---------------------------
  // Navbar JSX
  // ---------------------------
  return (
    <>
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            
            {/* Logo / Home Link */}
            <div className="flex items-center">
              <Link 
                to="/" 
                className="flex items-center gap-2"
                onClick={closeMobileMenu}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white">
                    <span className="text-sm font-bold">₿</span>
                  </div>
                  <span className="text-xl font-black tracking-tight text-gray-900">
                    PriceTracker
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex md:items-center md:gap-4">
              
              {/* Always show Home */}
              <NavLink to="/" className={navLinkClass} end>
                Home
              </NavLink>

              {!user ? (
                // ---------------------------
                // User Not Logged In - Desktop
                // ---------------------------
                <div className="flex items-center gap-2">
                  <NavLink to="/login" className={navLinkClass}>
                    Login
                  </NavLink>
                  <NavLink 
                    to="/signup" 
                    className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors duration-200"
                  >
                    Sign up
                  </NavLink>
                </div>
              ) : (
                // ---------------------------
                // User Logged In - Desktop
                // ---------------------------
                <div className="flex items-center gap-4">
                  <NavLink to="/my-tracked" className={navLinkClass}>
                    My Tracked
                  </NavLink>

                  {/* Admin Link (only if user is admin) */}
                  {(user?.is_admin || user?.is_superuser || user?.is_staff) && (
                    <NavLink to="/admin/dashboard" className={navLinkClass}>
                      Admin
                    </NavLink>
                  )}

                  {/* User Greeting & Dropdown */}
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 border-r border-gray-200 pr-3">
                      Hi, <span className="font-medium">{getUserDisplayName()}</span>
                    </span>
                    
                    <button
                      onClick={handleLogout}
                      className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors duration-200 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-900"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-lg">
            <div className="space-y-1 px-4 pb-3 pt-2">
              
              {/* Mobile Navigation Links */}
              <NavLink 
                to="/" 
                className={mobileNavLinkClass} 
                end
                onClick={closeMobileMenu}
              >
                Home
              </NavLink>

              {!user ? (
                // ---------------------------
                // User Not Logged In - Mobile
                // ---------------------------
                <>
                  <NavLink 
                    to="/login" 
                    className={mobileNavLinkClass}
                    onClick={closeMobileMenu}
                  >
                    Login
                  </NavLink>
                  <NavLink 
                    to="/signup" 
                    className={mobileNavLinkClass}
                    onClick={closeMobileMenu}
                  >
                    Sign up
                  </NavLink>
                </>
              ) : (
                // ---------------------------
                // User Logged In - Mobile
                // ---------------------------
                <>
                  <NavLink 
                    to="/my-tracked" 
                    className={mobileNavLinkClass}
                    onClick={closeMobileMenu}
                  >
                    My Tracked
                  </NavLink>

                  {/* Admin Link for Mobile */}
                  {(user?.is_admin || user?.is_superuser || user?.is_staff) && (
                    <NavLink 
                      to="/admin/dashboard" 
                      className={mobileNavLinkClass}
                      onClick={closeMobileMenu}
                    >
                      Admin
                    </NavLink>
                  )}

                  {/* User Info Mobile */}
                  <div className="border-t border-gray-200 pt-3">
                    <div className="px-3 py-2 text-sm text-gray-500">
                      Signed in as <span className="font-medium text-gray-900">{getUserDisplayName()}</span>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-50 md:hidden"
          onClick={closeMobileMenu}
        />
      )}
    </>
  );
}