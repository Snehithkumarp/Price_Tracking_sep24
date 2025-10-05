// // ==============================
// // 🚀 Main React App Setup
// // ==============================
// import { BrowserRouter, Routes, Route } from "react-router-dom";

// // ==============================
// // 🌐 Components
// // ==============================
// import Navbar from "./components/Navbar";
// import AdminLayout from "./components/AdminLayout";
// import { RequireAdmin } from "./components/RequireAdmin";

// // ==============================
// // 📄 User Pages
// // ==============================
// import HomePage from "./pages/Users/HomePage";
// import ProductDetailPage from "./pages/Users/ProductDetailPage";
// import LoginPage from "./pages/Users/LoginPage";
// import SignupPage from "./pages/Users/SignupPage";
// import MyTrackedProductsPage from "./pages/Users/MyTrackedProducts";

// // ==============================
// // 📄 Admin Pages
// // ==============================
// import Dashboard from "./pages/Admin/Dashboard";
// import ProductsPage from "./pages/Admin/Products";
// import TrackedProductsPage from "./pages/Admin/TrackedProducts";
// import PriceHistory from "./pages/Admin/PriceHistory";

// // ==============================
// // 🔐 Auth Context
// // ==============================
// import { AuthProvider } from "./context/AuthContext";

// // ==============================
// // 🏗 AppShell Component
// // ==============================
// function AppShell() {
//   return (
//     <div className="min-h-screen bg-gray-50 text-gray-900">
//       {/* Navbar */}
//       <Navbar />

//       {/* Main content container */}
//       <main className="flex-1">
//         <Routes>
//           {/* -------------------- */}
//           {/* User-facing routes   */}
//           {/* -------------------- */}
//           <Route path="/" element={<HomePage />} />
//           <Route path="/product/:id" element={<ProductDetailPage />} />
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/signup" element={<SignupPage />} />
//           <Route path="/my-tracked" element={<MyTrackedProductsPage />} />

//           {/* -------------------- */}
//           {/* Admin routes (protected) */}
//           {/* -------------------- */}
//           <Route
//             path="/admin/*"
//             element={
//               <RequireAdmin>
//                 <AdminLayout />
//               </RequireAdmin>
//             }
//           >
//             <Route index element={<Dashboard />} />
//             <Route path="dashboard" element={<Dashboard />} />
//             <Route path="products" element={<ProductsPage />} />
//             <Route path="tracked" element={<TrackedProductsPage />} />
//             <Route path="price-history/:productId?" element={<PriceHistory />} />
//           </Route>
//         </Routes>
//       </main>

//       {/* Footer */}
//       <footer className="mt-10 border-t bg-white/50">
//         <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-gray-500">
//           © {new Date().getFullYear()} PriceTrackr. Built with React, TailwindCSS & Recharts.
//         </div>
//       </footer>
//     </div>
//   );
// }

// // ==============================
// // 🌟 Main App Component
// // ==============================
// export default function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <AppShell />
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }


// ------------------
// Theme 02
// -------------------
// ==============================
// 🚀 Main React App Setup
// ==============================
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

// ==============================
// 🌐 Components
// ==============================
import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";
import { RequireAdmin } from "./components/RequireAdmin";

// ==============================
// 📄 User Pages
// ==============================
import HomePage from "./pages/Users/HomePage";
import ProductDetailPage from "./pages/Users/ProductDetailPage";
import LoginPage from "./pages/Users/LoginPage";
import SignupPage from "./pages/Users/SignupPage";
import MyTrackedProductsPage from "./pages/Users/MyTrackedProducts";
import NotFoundPage from "./pages/Users/NotFoundPage"; // Add a 404 page

// ==============================
// 📄 Admin Pages
// ==============================
import Dashboard from "./pages/Admin/Dashboard";
import ProductsPage from "./pages/Admin/Products";
import TrackedProductsPage from "./pages/Admin/TrackedProducts";
import PriceHistory from "./pages/Admin/PriceHistory";
import AdminUsersPage from "./pages/Admin/Users"; // Add admin users page

// ==============================
// 🔐 Auth Context
// ==============================
import { AuthProvider, useAuth } from "./context/AuthContext"; // Import useAuth

// ==============================
// 🔐 RequireAuth Component
// ==============================
function RequireAuth({ children }) {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// ==============================
// 🏗 AppShell Component
// ==============================
function AppShell() {
  const [loading, setLoading] = useState(true);

  // Simulate initial app loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading PriceTracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main content container - flex-1 to push footer down */}
      <main className="flex-1">
        <Routes>
          {/* -------------------- */}
          {/* Public routes        */}
          {/* -------------------- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* -------------------- */}
          {/* Protected user routes */}
          {/* -------------------- */}
          <Route 
            path="/my-tracked" 
            element={
              <RequireAuth>
                <MyTrackedProductsPage />
              </RequireAuth>
            } 
          />

          {/* -------------------- */}
          {/* Admin routes (protected) */}
          {/* -------------------- */}
          <Route
            path="/admin/*"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="tracked" element={<TrackedProductsPage />} />
            <Route path="price-history/:productId?" element={<PriceHistory />} />
            <Route path="users" element={<AdminUsersPage />} />
          </Route>

          {/* -------------------- */}
          {/* Error routes         */}
          {/* -------------------- */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-900 text-white text-xs font-bold">
                ₿
              </div>
              <span className="font-bold text-gray-900">PriceTracker</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-xs text-gray-600">
                © {new Date().getFullYear()} PriceTracker. 
                Built with React, TailwindCSS & Recharts.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Track prices across Amazon, Flipkart and more
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ==============================
// 🌟 Main App Component
// ==============================
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}



