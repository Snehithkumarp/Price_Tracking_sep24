// ==============================
// 🚀 Main React App Setup
// ==============================
import { BrowserRouter, Routes, Route } from "react-router-dom";

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

// ==============================
// 📄 Admin Pages
// ==============================
import Dashboard from "./pages/Admin/Dashboard";
import ProductsPage from "./pages/Admin/Products";
import TrackedProductsPage from "./pages/Admin/TrackedProducts";
import PriceHistory from "./pages/Admin/PriceHistory";

// ==============================
// 🔐 Auth Context
// ==============================
import { AuthProvider } from "./context/AuthContext";

// ==============================
// 🏗 AppShell Component
// ==============================
function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar */}
      <Navbar />

      {/* Main content container */}
      <main className="flex-1">
        <Routes>
          {/* -------------------- */}
          {/* User-facing routes   */}
          {/* -------------------- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/my-tracked" element={<MyTrackedProductsPage />} />

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
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="tracked" element={<TrackedProductsPage />} />
            <Route path="price-history/:productId?" element={<PriceHistory />} />
          </Route>
        </Routes>
      </main>

      {/* Footer */}
      <footer className="mt-10 border-t bg-white/50">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-gray-500">
          © {new Date().getFullYear()} PriceTrackr. Built with React, TailwindCSS & Recharts.
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
