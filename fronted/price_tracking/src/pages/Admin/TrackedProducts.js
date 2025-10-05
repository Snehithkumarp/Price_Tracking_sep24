// // ==============================
// // 👀 Admin - Tracked Products Page
// // ==============================
// import { useEffect, useState } from "react";
// import { apiFetch, API } from "../../utils/api";

// export default function TrackedProductsPage() {
//   const [trackedProducts, setTrackedProducts] = useState([]);
//   const [statusFilter, setStatusFilter] = useState("");

//   // Fetch tracked products from backend
//   useEffect(() => {
//     async function fetchTrackedProducts() {
//       const token = localStorage.getItem("token");
//       const headers = { Authorization: `Bearer ${token}` };

//       try {
//         const data = await apiFetch(API.trackedProducts("all/"), "GET", null, { headers });
//         setTrackedProducts(data);
//       } catch (error) {
//         console.error("Failed to fetch tracked products:", error);
//       }
//     }
//     fetchTrackedProducts();
//   }, []);

//   // Optional: Delete a tracked product
//   const deleteTrackedProduct = async (id) => {
//     const token = localStorage.getItem("token");
//     const headers = { Authorization: `Bearer ${token}` };
//     try {
//       await apiFetch(`${API.trackedProducts()}${id}/`, "DELETE", null, { headers });
//       setTrackedProducts(trackedProducts.filter((t) => t.id !== id));
//     } catch (error) {
//       console.error("Failed to delete tracked product:", error);
//     }
//   };

//   // Apply active/inactive filter
//   const filteredTracked = trackedProducts.filter((item) =>
//     statusFilter === ""
//       ? true
//       : statusFilter === "active"
//       ? item.active
//       : !item.active
//   );

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Tracked Products</h1>

//       {/* Filter */}
//       <div className="mb-4">
//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//           className="border px-3 py-2 rounded"
//         >
//           <option value="">All</option>
//           <option value="active">Active Only</option>
//           <option value="inactive">Inactive Only</option>
//         </select>
//       </div>

//       {/* Table */}
//       <table className="w-full border-collapse bg-white shadow rounded">
//         <thead>
//           <tr className="bg-gray-100 text-left">
//             <th className="p-3 border">User</th>
//             <th className="p-3 border">Product</th>
//             <th className="p-3 border">Threshold</th>
//             <th className="p-3 border">Status</th>
//             <th className="p-3 border">Created</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredTracked.map((item) => (
//             <tr key={item.id} className="hover:bg-gray-50">
//               <td className="p-3 border">{item.user?.username || "Unknown User"}</td>
//               <td className="p-3 border">{item.product?.title || "Unknown Product"}</td>
//               <td className="p-3 border">
//                 {item.threshold ? `₹${item.threshold}` : "—"}
//               </td>
//               <td className="p-3 border">
//                 {item.active ? "✅ Active" : "❌ Inactive"}
//               </td>
//               <td className="p-3 border">
//                 {item.created_at ? new Date(item.created_at).toLocaleString() : "—"}
//               </td>
//             </tr>
//           ))}
//           {filteredTracked.length === 0 && (
//             <tr>
//               <td colSpan="5" className="p-4 text-center text-gray-500">
//                 No tracked products found.
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }
// ---------------------------------------------------------------------------------
// working
// -----------------------------------------
// import { useEffect, useState } from "react";
// import { apiFetch, API } from "../../utils/api";

// export default function AdminTrackedProductsPage() {
//   const [trackedProducts, setTrackedProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [statusFilter, setStatusFilter] = useState("");
//   const [imageErrors, setImageErrors] = useState(new Set());

//   useEffect(() => {
//     async function fetchTrackedProducts() {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.error("No token found, cannot fetch tracked products");
//         return;
//       }
//       const headers = { Authorization: `Bearer ${token}` };

//       try {
//         setLoading(true);
//         setError(null);
//         const data = await apiFetch(API.adminTrackedProducts(), "GET", null, { headers });
//         setTrackedProducts(data);
//       } catch (err) {
//         console.error("Failed to fetch tracked products:", err);
//         setError("Failed to load tracked products");
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchTrackedProducts();
//   }, []);

//   const deleteTrackedProduct = async (id) => {
//     if (!window.confirm("Are you sure you want to remove this tracking?")) return;

//     const token = localStorage.getItem("token");
//     const headers = { Authorization: `Bearer ${token}` };

//     try {
//       await apiFetch(`${API.adminTrackedProducts()}${id}/`, "DELETE", null, { headers });
//       setTrackedProducts(trackedProducts.filter((t) => t.id !== id));
//     } catch (err) {
//       console.error("Failed to delete tracked product:", err);
//       setError("Failed to delete tracking");
//     }
//   };

//   const handleImageError = (productId) => {
//     setImageErrors(prev => new Set(prev).add(productId));
//   };

//   const filteredTracked = trackedProducts.filter((item) =>
//     statusFilter === ""
//       ? true
//       : statusFilter === "active"
//       ? item.active
//       : !item.active
//   );

//   if (loading) {
//     return (
//       <div className="p-6 text-center">
//         <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//         <p className="mt-4 text-gray-600">Loading tracked products...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Tracked Products (All Users)</h1>

//       <div className="mb-4">
//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//           className="border px-3 py-2 rounded"
//         >
//           <option value="">All</option>
//           <option value="active">Active Only</option>
//           <option value="inactive">Inactive Only</option>
//         </select>
//       </div>

//       {error && <p className="text-red-600 mb-4">{error}</p>}

//       <table className="w-full border-collapse bg-white shadow rounded">
//         <thead>
//           <tr className="bg-gray-100 text-left">
//             <th className="p-3 border">User</th>
//             <th className="p-3 border">Product</th>
//             <th className="p-3 border">Threshold</th>
//             <th className="p-3 border">Status</th>
//             <th className="p-3 border">Created</th>
//             <th className="p-3 border">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredTracked.map((item) => (
//             <tr key={item.id} className="hover:bg-gray-50">
//               <td className="p-3 border">{item.user?.username || "Unknown User"}</td>
//               <td className="p-3 border">
//                 {item.product?.title || "Unknown Product"}
//               </td>
//               <td className="p-3 border">{item.threshold ? `₹${item.threshold}` : "—"}</td>
//               <td className="p-3 border">{item.active ? "✅ Active" : "❌ Inactive"}</td>
//               <td className="p-3 border">{item.created_at ? new Date(item.created_at).toLocaleString() : "—"}</td>
//               <td className="p-3 border">
//                 <button
//                   onClick={() => deleteTrackedProduct(item.id)}
//                   className="text-red-600 hover:text-red-900"
//                 >
//                   Remove
//                 </button>
//               </td>
//             </tr>
//           ))}
//           {filteredTracked.length === 0 && (
//             <tr>
//               <td colSpan="6" className="p-4 text-center text-gray-500">
//                 No tracked products found.
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// ----------------
import { useEffect, useState } from "react";
import { apiFetch, API, API_BASE } from "../../utils/api";

export default function AdminTrackedProductsPage() {
  const [trackedProducts, setTrackedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [imageErrors, setImageErrors] = useState(new Set());
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  
  useEffect(() => {
    async function fetchTrackedProducts() {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found, cannot fetch tracked products");
        setError("Authentication required.");
        setLoading(false);
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch(API.adminTrackedProducts(), "GET", null, {
          headers,
        });
        console.log("Fetched tracked products:", data); // ✅ ADD THIS
      
        const products = data.results || data;
        console.log("Product IDs:", products.map(p => p.id)); // ✅ ADD THIS

        setTrackedProducts(products);
        
      } catch (err) {
        console.error("Failed to fetch tracked products:", err);
        setError(
          "Failed to load tracked products. Please check if the endpoint is correct."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchTrackedProducts();
  }, []);

  const deleteTrackedProduct = async (id) => {
    if (!window.confirm("Are you sure you want to remove this tracking?"))
      return;

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      setDeleteLoading(id);
      setError(null);

      // ✅ SIMPLE FIX: Use the trackedProducts endpoint and append ID
      await apiFetch(`${API.trackedProducts()}${id}/`, "DELETE", null, { headers });

      // Remove from state
      setTrackedProducts(trackedProducts.filter((t) => t.id !== id));

      // ✅ Show success message
      alert("✅ Successfully deleted the tracked product.");

    } catch (err) {
      console.error("Failed to delete tracked product:", err);
      setError(`Failed to delete tracking: ${err.message}`);
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleImageError = (productId) => {
    setImageErrors((prev) => new Set(prev).add(productId));
  };

  const filteredTracked = trackedProducts.filter((item) =>
    statusFilter === ""
      ? true
      : statusFilter === "active"
      ? item.active
      : !item.active
  );

  // Stats calculation
  const stats = {
    total: trackedProducts.length,
    active: trackedProducts.filter((item) => item.active).length,
    inactive: trackedProducts.filter((item) => !item.active).length,
    withThreshold: trackedProducts.filter((item) => item.threshold).length,
    users: [...new Set(trackedProducts.map((item) => item.user?.id))].length,
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tracked Products</h1>
        </div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading tracked products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header & Filter */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tracked Products</h1>
          <p className="text-gray-600 mt-1">
            {stats.total} tracking{stats.total !== 1 ? "s" : ""} across{" "}
            {stats.users} user{stats.users !== 1 ? "s" : ""}
          </p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Trackings</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Trackings
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.inactive}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">With Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.withThreshold}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Alert Threshold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTracked.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  {/* User */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 text-sm font-medium">
                          {item.user?.username?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.user?.username || "Unknown User"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.user?.email || ""}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Product */}
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {item.product?.image_url &&
                      !imageErrors.has(item.product.id) ? (
                        <img
                          src={item.product.image_url}
                          alt={item.product.title}
                          className="h-10 w-10 rounded-lg object-cover mr-3"
                          onError={() => handleImageError(item.product.id)}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-gray-400 text-xs">
                            No Image
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate text-wrap">
                          {item.product?.title || "Unknown Product"}
                        </div>
                        {item.nickname && (
                          <div className="text-xs text-gray-500">
                            Nickname: {item.nickname}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Current Price */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-green-600">
                      ₹{item.product?.current_price || "—"}
                    </span>
                  </td>

                  {/* Alert Threshold */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.threshold ? (
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          ₹{item.threshold}
                        </span>
                        {item.product?.current_price && (
                          <span
                            className={`ml-2 text-xs px-2 py-1 rounded-full ${
                              parseFloat(item.product.current_price) <=
                              parseFloat(item.threshold)
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {parseFloat(item.product.current_price) <=
                            parseFloat(item.threshold)
                              ? "Alert!"
                              : "Watching"}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Created */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => deleteTrackedProduct(item.id)}
                      className="text-red-600 hover:text-red-900 transition duration-150"
                      title="Remove Tracking"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTracked.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No tracked products found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {statusFilter
                        ? `No ${statusFilter} trackings found.`
                        : "Get started by having users track products."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ----------------------------

// fixed
// deepseek
// import { useEffect, useState } from "react";
// import { apiFetch, API } from "../../utils/api";

// export default function AdminTrackedProductsPage() {
//   const [trackedProducts, setTrackedProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [statusFilter, setStatusFilter] = useState("");
//   const [imageErrors, setImageErrors] = useState(new Set());

//   useEffect(() => {
//     async function fetchTrackedProducts() {
//       try {
//         setLoading(true);
//         setError(null);
//         const data = await apiFetch(API.adminTrackedProducts(), "GET"); // Use trackedProducts instead of adminTrackedProducts
//         setTrackedProducts(data.results || data);
//       } catch (err) {
//         console.error("Failed to fetch tracked products:", err);
//         setError("Failed to load tracked products. Please check if the endpoint is correct.");
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchTrackedProducts();
//   }, []);

//   const deleteTrackedProduct = async (id) => {
//     if (!window.confirm("Are you sure you want to remove this tracking?")) return;

//     try {
//       await apiFetch(`${API.trackedProducts()}${id}/`, "DELETE");
//       setTrackedProducts(trackedProducts.filter((t) => t.id !== id));
//     } catch (err) {
//       console.error("Failed to delete tracked product:", err);
//       setError("Failed to delete tracking");
//     }
//   };

//   const handleImageError = (productId) => {
//     setImageErrors(prev => new Set(prev).add(productId));
//   };

//   const filteredTracked = trackedProducts.filter((item) =>
//     statusFilter === ""
//       ? true
//       : statusFilter === "active"
//       ? item.active
//       : !item.active
//   );

//   // Stats calculation
//   const stats = {
//     total: trackedProducts.length,
//     active: trackedProducts.filter(item => item.active).length,
//     inactive: trackedProducts.filter(item => !item.active).length,
//     withThreshold: trackedProducts.filter(item => item.threshold).length,
//     users: [...new Set(trackedProducts.map(item => item.user?.id))].length,
//   };

//   if (loading) {
//     return (
//       <div className="p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">Tracked Products</h1>
//         </div>
//         <div className="text-center py-12">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           <p className="mt-4 text-gray-600">Loading tracked products...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Tracked Products</h1>
//           <p className="text-gray-600 mt-1">
//             {stats.total} tracking{stats.total !== 1 ? 's' : ''} across {stats.users} user{stats.users !== 1 ? 's' : ''}
//           </p>
//         </div>

//         {/* Filter */}
//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//           className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="">All Trackings</option>
//           <option value="active">Active Only</option>
//           <option value="inactive">Inactive Only</option>
//         </select>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
//           <div className="flex justify-between items-center">
//             <span>{error}</span>
//             <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
//           <div className="flex items-center">
//             <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//               </svg>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Trackings</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
//           <div className="flex items-center">
//             <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-600">Active</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
//           <div className="flex items-center">
//             <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-600">Inactive</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
//           <div className="flex items-center">
//             <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//               </svg>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-600">With Alerts</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.withThreshold}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   User
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Product
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Current Price
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Alert Threshold
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Created
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredTracked.map((item) => (
//                 <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
//                   {/* User Column */}
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
//                         <span className="text-blue-600 text-sm font-medium">
//                           {item.user?.username?.charAt(0).toUpperCase() || 'U'}
//                         </span>
//                       </div>
//                       <div>
//                         <div className="text-sm font-medium text-gray-900">
//                           {item.user?.username || "Unknown User"}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {item.user?.email || ""}
//                         </div>
//                       </div>
//                     </div>
//                   </td>

//                   {/* Product Column */}
//                   <td className="px-6 py-4">
//                     <div className="flex items-center">
//                       {item.product?.image_url && !imageErrors.has(item.product.id) ? (
//                         <img
//                           src={item.product.image_url}
//                           alt={item.product.title}
//                           className="h-10 w-10 rounded-lg object-cover mr-3"
//                           onError={() => handleImageError(item.product.id)}
//                         />
//                       ) : (
//                         <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
//                           <span className="text-gray-400 text-xs">No Image</span>
//                         </div>
//                       )}
//                       <div className="flex-1 min-w-0">
//                         <div className="text-sm font-medium text-gray-900 truncate">
//                           {item.product?.title || "Unknown Product"}
//                         </div>
//                         {item.nickname && (
//                           <div className="text-xs text-gray-500">
//                             Nickname: {item.nickname}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </td>

//                   {/* Current Price Column */}
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className="text-sm font-semibold text-green-600">
//                       ₹{item.product?.current_price || '—'}
//                     </span>
//                   </td>

//                   {/* Alert Threshold Column */}
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {item.threshold ? (
//                       <div className="flex items-center">
//                         <span className="text-sm font-medium text-gray-900">
//                           ₹{item.threshold}
//                         </span>
//                         {item.product?.current_price && item.threshold && (
//                           <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
//                             parseFloat(item.product.current_price) <= parseFloat(item.threshold)
//                               ? 'bg-green-100 text-green-800'
//                               : 'bg-yellow-100 text-yellow-800'
//                           }`}>
//                             {parseFloat(item.product.current_price) <= parseFloat(item.threshold) ? 'Alert!' : 'Watching'}
//                           </span>
//                         )}
//                       </div>
//                     ) : (
//                       <span className="text-sm text-gray-400">—</span>
//                     )}
//                   </td>

//                   {/* Status Column */}
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                       item.active
//                         ? 'bg-green-100 text-green-800'
//                         : 'bg-red-100 text-red-800'
//                     }`}>
//                       {item.active ? 'Active' : 'Inactive'}
//                     </span>
//                   </td>

//                   {/* Created Date Column */}
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {item.created_at
//                       ? new Date(item.created_at).toLocaleDateString('en-IN', {
//                           day: '2-digit',
//                           month: 'short',
//                           year: 'numeric'
//                         })
//                       : "—"
//                     }
//                   </td>

//                   {/* Actions Column */}
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <button
//                       onClick={() => deleteTrackedProduct(item.id)}
//                       className="text-red-600 hover:text-red-900 transition duration-150"
//                       title="Remove Tracking"
//                     >
//                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                       </svg>
//                     </button>
//                   </td>
//                 </tr>
//               ))}

//               {filteredTracked.length === 0 && (
//                 <tr>
//                   <td colSpan="7" className="px-6 py-12 text-center">
//                     <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                     <h3 className="mt-2 text-sm font-medium text-gray-900">No tracked products found</h3>
//                     <p className="mt-1 text-sm text-gray-500">
//                       {statusFilter ? `No ${statusFilter} trackings found.` : 'Get started by having users track products.'}
//                     </p>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// ----------------------------------------------------------------

// // ==============================
// // 👀 Admin - Tracked Products Page
// // ==============================
// import { useEffect, useState } from "react";
// import { apiFetch, API } from "../../utils/api";

// export default function TrackedProductsPage() {
//   const [trackedProducts, setTrackedProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [statusFilter, setStatusFilter] = useState("");
//   const [imageErrors, setImageErrors] = useState(new Set());

//   // Fetch tracked products from backend
//   useEffect(() => {
//     async function fetchTrackedProducts() {
//       try {
//         setLoading(true);
//         setError(null);
//         const data = await apiFetch(API.trackedProducts(), "GET");
//         setTrackedProducts(data.results || data);
//       } catch (error) {
//         console.error("Failed to fetch tracked products:", error);
//         setError("Failed to load tracked products");
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchTrackedProducts();
//   }, []);

//   // Delete a tracked product
//   const deleteTrackedProduct = async (id) => {
//     if (!window.confirm("Are you sure you want to remove this tracking?")) return;

//     try {
//       await apiFetch(`${API.trackedProducts()}${id}/`, "DELETE");
//       setTrackedProducts(trackedProducts.filter((t) => t.id !== id));
//     } catch (error) {
//       console.error("Failed to delete tracked product:", error);
//       setError("Failed to delete tracking");
//     }
//   };

//   const handleImageError = (productId) => {
//     setImageErrors(prev => new Set(prev).add(productId));
//   };

//   // Apply active/inactive filter
//   const filteredTracked = trackedProducts.filter((item) =>
//     statusFilter === ""
//       ? true
//       : statusFilter === "active"
//       ? item.active
//       : !item.active
//   );

//   // Stats calculation
//   const stats = {
//     total: trackedProducts.length,
//     active: trackedProducts.filter(item => item.active).length,
//     inactive: trackedProducts.filter(item => !item.active).length,
//     withThreshold: trackedProducts.filter(item => item.threshold).length,
//   };

//   if (loading) {
//     return (
//       <div className="p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">Tracked Products</h1>
//         </div>
//         <div className="text-center py-12">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           <p className="mt-4 text-gray-600">Loading tracked products...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Tracked Products</h1>
//           <p className="text-gray-600 mt-1">
//             {stats.total} tracking{stats.total !== 1 ? 's' : ''} across all users
//           </p>
//         </div>

//         {/* Filter */}
//         <select
//           value={statusFilter}
//           onChange={(e) => setStatusFilter(e.target.value)}
//           className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="">All Trackings</option>
//           <option value="active">Active Only</option>
//           <option value="inactive">Inactive Only</option>
//         </select>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
//           <div className="flex justify-between items-center">
//             <span>{error}</span>
//             <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//         <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
//           <div className="flex items-center">
//             <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
//               </svg>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-600">Total Trackings</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
//           <div className="flex items-center">
//             <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-600">Active</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
//           <div className="flex items-center">
//             <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
//               </svg>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-600">Inactive</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
//             </div>
//           </div>
//         </div>

//         <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
//           <div className="flex items-center">
//             <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
//               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//               </svg>
//             </div>
//             <div>
//               <p className="text-sm font-medium text-gray-600">With Alerts</p>
//               <p className="text-2xl font-bold text-gray-900">{stats.withThreshold}</p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Table */}
//       <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   User
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Product
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Current Price
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Alert Threshold
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Created
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredTracked.map((item) => (
//                 <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
//                   {/* User Column */}
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <div className="flex items-center">
//                       <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
//                         <span className="text-blue-600 text-sm font-medium">
//                           {item.user?.username?.charAt(0).toUpperCase() || 'U'}
//                         </span>
//                       </div>
//                       <div>
//                         <div className="text-sm font-medium text-gray-900">
//                           {item.user?.username || "Unknown User"}
//                         </div>
//                         <div className="text-xs text-gray-500">
//                           {item.user?.email || ""}
//                         </div>
//                       </div>
//                     </div>
//                   </td>

//                   {/* Product Column */}
//                   <td className="px-6 py-4">
//                     <div className="flex items-center">
//                       {item.product?.image_url && !imageErrors.has(item.product.id) ? (
//                         <img
//                           src={item.product.image_url}
//                           alt={item.product.title}
//                           className="h-10 w-10 rounded-lg object-cover mr-3"
//                           onError={() => handleImageError(item.product.id)}
//                         />
//                       ) : (
//                         <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center mr-3">
//                           <span className="text-gray-400 text-xs">No Image</span>
//                         </div>
//                       )}
//                       <div className="flex-1 min-w-0">
//                         <div className="text-sm font-medium text-gray-900 truncate">
//                           {item.product?.title || "Unknown Product"}
//                         </div>
//                         {item.nickname && (
//                           <div className="text-xs text-gray-500">
//                             Nickname: {item.nickname}
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </td>

//                   {/* Current Price Column */}
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className="text-sm font-semibold text-green-600">
//                       ₹{item.product?.current_price || '—'}
//                     </span>
//                   </td>

//                   {/* Alert Threshold Column */}
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     {item.threshold ? (
//                       <div className="flex items-center">
//                         <span className="text-sm font-medium text-gray-900">
//                           ₹{item.threshold}
//                         </span>
//                         {item.product?.current_price && item.threshold && (
//                           <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
//                             parseFloat(item.product.current_price) <= parseFloat(item.threshold)
//                               ? 'bg-green-100 text-green-800'
//                               : 'bg-yellow-100 text-yellow-800'
//                           }`}>
//                             {parseFloat(item.product.current_price) <= parseFloat(item.threshold) ? 'Alert!' : 'Watching'}
//                           </span>
//                         )}
//                       </div>
//                     ) : (
//                       <span className="text-sm text-gray-400">—</span>
//                     )}
//                   </td>

//                   {/* Status Column */}
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
//                       item.active
//                         ? 'bg-green-100 text-green-800'
//                         : 'bg-red-100 text-red-800'
//                     }`}>
//                       {item.active ? 'Active' : 'Inactive'}
//                     </span>
//                   </td>

//                   {/* Created Date Column */}
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                     {item.created_at
//                       ? new Date(item.created_at).toLocaleDateString('en-IN', {
//                           day: '2-digit',
//                           month: 'short',
//                           year: 'numeric'
//                         })
//                       : "—"
//                     }
//                   </td>

//                   {/* Actions Column */}
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <button
//                       onClick={() => deleteTrackedProduct(item.id)}
//                       className="text-red-600 hover:text-red-900 transition duration-150"
//                       title="Remove Tracking"
//                     >
//                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                       </svg>
//                     </button>
//                   </td>
//                 </tr>
//               ))}

//               {filteredTracked.length === 0 && (
//                 <tr>
//                   <td colSpan="7" className="px-6 py-12 text-center">
//                     <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                     <h3 className="mt-2 text-sm font-medium text-gray-900">No tracked products found</h3>
//                     <p className="mt-1 text-sm text-gray-500">
//                       {statusFilter ? `No ${statusFilter} trackings found.` : 'Get started by having users track products.'}
//                     </p>
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }
