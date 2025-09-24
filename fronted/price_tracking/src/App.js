// ==============================
// 🚀 Main React App Setup
// ==============================
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ==============================
// 🌐 Components
// ==============================
import Navbar from "./components/Navbar";

// ==============================
// 📄 Pages
// ==============================
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import MyTrackedProductsPage from "./pages/MyTrackedProducts";

// ==============================
// 🔐 Auth Context
// ==============================
import { AuthProvider } from "./context/AuthContext";

// ==============================
// 🏗 AppShell Component
//    Main layout of your app:
//    - Navbar
//    - Main content rendered by React Router
//    - Footer
// ==============================
function AppShell() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Navbar: Shows links + login/logout info */}
      <Navbar />

      {/* Main content container */}
      <main className="flex-1">
        <Routes>
          {/* 🏠 Home page with search */}
          <Route path="/" element={<HomePage />} />

          {/* 📦 Product details page */}
          <Route path="/product/:id" element={<ProductDetailPage />} />

          {/* 🔑 Login page */}
          <Route path="/login" element={<LoginPage />} />

          {/* ✍️ Signup page */}
          <Route path="/signup" element={<SignupPage />} />

          {/* 📌 My tracked products */}
          <Route path="/my-tracked" element={<MyTrackedProductsPage />} />
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
//    Wraps everything in AuthProvider
//    and BrowserRouter for routing
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
