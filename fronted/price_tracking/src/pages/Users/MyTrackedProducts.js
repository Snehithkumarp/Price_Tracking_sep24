// // ==============================
// // 📌 My Tracked Products Page
// // ==============================
// // This page shows all products the logged-in user is tracking.
// // Users can remove tracked products or set price alerts.

// import React, { useEffect, useState } from "react";
// import { useAuth } from "../../context/AuthContext"; // custom auth hook
// import { apiFetch } from "../../utils/fetcher"; // wrapper for API calls
// import { API_BASE } from "../../utils/api"; // base URL of backend API

// export default function MyTrackedProductsPage() {
//   const auth = useAuth(); // get current user's token & info

//   // ==============================
//   // 🔹 Local state
//   // ==============================
//   const [tracked, setTracked] = useState([]); // stores list of tracked products
//   const [loading, setLoading] = useState(true); // loading indicator
//   const [error, setError] = useState(""); // error messages

//   // ==============================
//   // 🔹 Fetch tracked products from backend
//   // ==============================
//   const fetchTracked = async () => {
//     setLoading(true); // show loader
//     setError(""); // reset error

//     try {
//       // Make GET request to backend API to fetch user's tracked products
//       const data = await apiFetch(
//         `${API_BASE}/api/tracked/`,
//         "GET",
//         null,
//         auth.token // include auth token in request
//       );

//       setTracked(data); // update state with fetched products
//     } catch (err) {
//       // handle errors
//       console.error("Error fetching tracked products:", err);
//       setError(err.message || "Failed to load tracked products");
//     } finally {
//       setLoading(false); // hide loader
//     }
//   };

//   // Fetch tracked products when component mounts, only if user is logged in
//   useEffect(() => {
//     if (auth.token) fetchTracked();
//   }, [auth.token]);

//   // ==============================
//   // 🔹 Remove a product from tracked list
//   // ==============================
//   const handleRemove = async (id) => {
//     // Ask for confirmation before removing
//     if (!window.confirm("Remove this product from tracked list?")) return;

//     try {
//       // Send DELETE request to backend
//       await apiFetch(
//         `${API_BASE}/api/tracked/${id}/`,
//         "DELETE",
//         null,
//         auth.token
//       );

//       // Refresh tracked products from backend to stay in sync
//       await fetchTracked();
//     } catch (err) {
//       console.error("Error removing tracked product:", err);
//       alert("❌ Failed to remove product.");
//     }
//   };

//   // ==============================
//   // 🔹 Set a price alert (unified function)
//   // ==============================
//   const handleSetAlert = async (productOrTracked) => {
//     if (!auth.token) {
//       alert("❌ You must be logged in");
//       return;
//     }

//     // Ask user for threshold price
//     const raw = prompt("Enter price threshold (numbers only):");
//     if (!raw) return;

//     const threshold = parseInt(raw);
//     if (isNaN(threshold)) {
//       alert("Invalid number");
//       return;
//     }

//     try {
//       let trackedId;

//       // -----------------------------
//       // Determine if the product is already tracked
//       // -----------------------------
//       if (productOrTracked.id && productOrTracked.product) {
//         // Already tracked product from MyTrackedProductsPage
//         trackedId = productOrTracked.id;
//       } else {
//         // ProductDetail page: need to create tracked product first
//         const trackedResp = await apiFetch(
//           `${API_BASE}/api/tracked/`,
//           "POST",
//           { product_id: productOrTracked.id },
//           auth.token
//         );
//         trackedId = trackedResp.id;
//       }

//       // -----------------------------
//       // Send request to set alert
//       // -----------------------------
//       const alertResp = await apiFetch(
//         `${API_BASE}/api/tracked/${trackedId}/set-alert/`,
//         "POST",
//         { threshold },
//         auth.token
//       );

//       console.log("✅ Alert set response:", alertResp);
//       alert(`✅ ${alertResp.message || "Alert set successfully!"}`);

//       // Refresh tracked list if we're on the tracked products page
//       if (tracked) await fetchTracked();
//     } catch (err) {
//       console.error("❌ Error setting alert:", err);
//       if (err.response) {
//         const text = await err.response.text();
//         console.error("Backend error body:", text);
//       }
//       alert("❌ Failed to set alert.");
//     }
//   };

//   // ==============================
//   // 🔹 Not logged-in view
//   // ==============================
//   if (!auth.token) {
//     return <div className="p-6">Please log in to view your tracked products.</div>;
//   }

//   if (loading) {
//     return (
//       <div className="p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">My Tracked</h1>
//         </div>
//         <div className="text-center py-12">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           <p className="mt-4 text-gray-600">Loading Tracked products...</p>
//         </div>
//       </div>
//     );
//   }

//   // ==============================
//   // 🔹 Render tracked products list
//   // ==============================
//   return (
//     <div className="mx-auto max-w-4xl p-6">
//       <h1 className="text-2xl font-bold mb-4">My Tracked Products</h1>

//       {/* Show loading state */}
//       {loading && <div>Loading…</div>}

//       {/* Show error message if any */}
//       {error && <div className="text-red-600">{error}</div>}

//       {/* List of tracked products */}
//       <ul className="space-y-4">
//         {tracked.length > 0 &&
//           tracked.map((t) => (
//             <li key={t.id} className="flex items-center gap-4 border rounded p-3">
//               {/* Product image */}
//               <img
//                 src={t.product?.image_url}
//                 alt={t.product?.title}
//                 className="w-20 h-20 object-cover rounded"
//               />

//               {/* Product info */}
//               {/* <div className="flex-1">
//                 <div className="font-semibold">{t?.nickname || t?.product?.title}</div>
//                 <div className="text-sm text-gray-600">
//                   Current: {t.product?.currency}{t.product?.current_price}
//                 </div>
//               </div> */}
//               <div className="flex-1">
//                 <div className="font-semibold">{t?.nickname || t?.product?.title}</div>
//                 <div className="text-sm text-gray-600 font-bold text-green-600">
//                   Current: {t.product?.currency}{t.product?.current_price}
//                 </div>
//                 <div className="text-sm text-gray-600 font-bold text-red-600">
//                   Alert: {t.threshold ? `${t.product?.currency}${t.threshold}` : "—"} {/* Show dash if no alert is set */}
//                 </div>
//               </div>


//               {/* Action buttons */}
//               <div className="flex flex-col gap-2">
//                 <button
//                   onClick={() => handleSetAlert(t)}
//                   className="rounded px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700"
//                 >
//                   Set Alert
//                 </button>
//                 <button
//                   onClick={() => handleRemove(t.id)}
//                   className="rounded px-3 py-2 bg-red-500 text-white hover:bg-red-600"
//                 >
//                   Remove
//                 </button>
//               </div>
//             </li>
//           ))}
//       </ul>

//       {/* Empty state if no tracked products */}
//       {!loading && tracked.length === 0 && (
//         <div className="mt-6 text-sm text-gray-500">
//           You are not tracking any products yet.
//         </div>
//       )}
//     </div>
//   );
// }


// ---------------------------
// Theme 02
// ---------------------------

// ==============================
// 📌 My Tracked Products Page
// ==============================
// This page shows all products the logged-in user is tracking.
// Users can remove tracked products or set price alerts.

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../utils/fetcher"; // Only import apiFetch from fetcher
import { API } from "../../utils/api"; // Import API from api.js

export default function MyTrackedProductsPage() {
  const { token, user } = useAuth();
  const [tracked, setTracked] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());

  // ==============================
  // 🔹 Fetch tracked products from backend
  // ==============================
  const fetchTracked = async () => {
    if (!token) return;
    
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch(API.trackedProducts(), "GET");
      setTracked(data.results || data);
    } catch (err) {
      console.error("Error fetching tracked products:", err);
      setError(err.message || "Failed to load tracked products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchTracked();
  }, [token]);

  // ==============================
  // 🔹 Remove a product from tracked list
  // ==============================
  const handleRemove = async (id) => {
    if (!window.confirm("Remove this product from your tracked list?")) return;

    setUpdatingId(id);
    try {
      await apiFetch(`${API.trackedProducts()}${id}/`, "DELETE");
      setTracked(tracked.filter(item => item.id !== id));
    } catch (err) {
      console.error("Error removing tracked product:", err);
      alert("Failed to remove product. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ==============================
  // 🔹 Set/Update price alert
  // ==============================
  const handleSetAlert = async (trackedItem) => {
    if (!token) {
      alert("Please log in to set alerts");
      return;
    }

    const currentThreshold = trackedItem.threshold;
    const raw = prompt(
      `Enter price alert threshold (numbers only):${currentThreshold ? `\nCurrent: ₹${currentThreshold}` : ''}`,
      currentThreshold || ""
    );
    
    if (raw === null) return; // User cancelled

    const threshold = parseFloat(raw);
    if (isNaN(threshold) || threshold <= 0) {
      alert("Please enter a valid positive number");
      return;
    }

    setUpdatingId(trackedItem.id);
    try {
      const response = await apiFetch(
        `${API.trackedProducts()}${trackedItem.id}/set-alert/`,
        "POST",
        { threshold }
      );

      // Update local state
      setTracked(tracked.map(item => 
        item.id === trackedItem.id 
          ? { ...item, threshold: threshold }
          : item
      ));

      alert(`✅ Price alert set at ₹${threshold}`);
    } catch (err) {
      console.error("Error setting alert:", err);
      alert("Failed to set alert. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ==============================
  // 🔹 Toggle active status
  // ==============================
  const toggleActiveStatus = async (trackedItem) => {
    setUpdatingId(trackedItem.id);
    try {
      const response = await apiFetch(
        `${API.trackedProducts()}${trackedItem.id}/`,
        "PATCH",
        { active: !trackedItem.active }
      );

      setTracked(tracked.map(item => 
        item.id === trackedItem.id 
          ? { ...item, active: !trackedItem.active }
          : item
      ));
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update tracking status");
    } finally {
      setUpdatingId(null);
    }
  };

  // ==============================
  // 🔹 Handle image errors
  // ==============================
  const handleImageError = (productId) => {
    setImageErrors(prev => new Set(prev).add(productId));
  };

  // ==============================
  // 🔹 Calculate stats
  // ==============================
  const stats = {
    total: tracked.length,
    active: tracked.filter(item => item.active).length,
    withAlerts: tracked.filter(item => item.threshold).length,
    priceDrops: tracked.filter(item => 
      item.product?.current_price && item.threshold && 
      parseFloat(item.product.current_price) <= parseFloat(item.threshold)
    ).length,
  };

  // ==============================
  // 🔹 Not logged-in view
  // ==============================
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Please log in to view your tracked products.
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Tracked Products</h1>
          </div>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading your tracked products...</p>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // 🔹 Render tracked products list
  // ==============================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Tracked Products</h1>
            <p className="text-gray-600 mt-1">
              {stats.total} product{stats.total !== 1 ? 's' : ''} being tracked
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tracked</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
              <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">With Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.withAlerts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Price Drops</p>
                <p className="text-2xl font-bold text-gray-900">{stats.priceDrops}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError("")} className="text-red-700 hover:text-red-900">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Tracked Products List */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {tracked.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tracked products</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by tracking some products from the home page.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {tracked.map((item) => {
                const isUpdating = updatingId === item.id;
                const isPriceBelowThreshold = item.product?.current_price && item.threshold && 
                  parseFloat(item.product.current_price) <= parseFloat(item.threshold);
                
                return (
                  <div key={item.id} className="p-6 hover:bg-gray-50 transition duration-150">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {item.product?.image_url && !imageErrors.has(item.product.id) ? (
                          <img
                            src={item.product.image_url}
                            alt={item.product.title}
                            className="h-16 w-16 rounded-lg object-cover"
                            onError={() => handleImageError(item.product.id)}
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 truncate text-wrap">
                              {item.nickname || item.product?.title}
                            </h3>
                            {item.nickname && (
                              <p className="text-sm text-gray-500 mt-1">
                                {item.product?.title}
                              </p>
                            )}
                            <div className="mt-2 flex items-center space-x-4 text-sm">
                              <span className="font-semibold text-green-600">
                                Current: ₹{item.product?.current_price || '—'}
                              </span>
                              <span className="font-semibold text-blue-600">
                                Alert: {item.threshold ? `₹${item.threshold}` : 'Not set'}
                              </span>
                              {isPriceBelowThreshold && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Price Drop! 🎉
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="ml-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {item.active ? 'Active' : 'Paused'}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex items-center space-x-3">
                          <button
                            onClick={() => handleSetAlert(item)}
                            disabled={isUpdating}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdating ? (
                              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent mr-1"></div>
                            ) : null}
                            {item.threshold ? 'Update Alert' : 'Set Alert'}
                          </button>

                          <button
                            onClick={() => toggleActiveStatus(item)}
                            disabled={isUpdating}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {item.active ? 'Pause' : 'Resume'}
                          </button>

                          <button
                            onClick={() => handleRemove(item.id)}
                            disabled={isUpdating}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
