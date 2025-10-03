// import { Routes, Route } from "react-router-dom";
// import AdminLayout from "../components/AdminLayout";
// import Dashboard from "../pages/Admin/Dashboard";
// import Products from "../pages/Admin/Products";
// import TrackedProducts from "../pages/Admin/TrackedProducts";
// import PriceHistory from "../pages/Admin/PriceHistory";



// export default function AdminRoute({ children }) {
//   const isAdmin = localStorage.getItem("is_admin") === "true"; // set this at login
//   return isAdmin ? children : <Navigate to="/" />;
// }
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RequireAdmin({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return user.is_admin ? children : <Navigate to="/" replace />;
}

// function AdminRoute() {
//   return (
//     <Routes>
//       <Route path="/admin" element={<AdminLayout />}>
//         <Route path="dashboard" element={<Dashboard />} />
//         <Route path="products" element={<Products />} />
//         <Route path="tracked" element={<TrackedProducts />} />
//         <Route path="price-history" element={<PriceHistory />} />
//       </Route>
//     </Routes>
//   );
// }

// export default AdminRoute;