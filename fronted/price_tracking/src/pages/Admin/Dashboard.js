// import { useEffect, useState } from "react";
// import { API } from "../../utils/api";
// // import { apiFetch } from "../../utils/fetcher";

// export default function Dashboard() {
//   const [stats, setStats] = useState({ products: 0, tracked: 0, users: 0 });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   // const [rawData, setRawData] = useState({ products: null, tracked: null, users: null });

//   useEffect(() => {
//     async function fetchStats() {
//       setLoading(true);
//       setError(null);

//       const token = localStorage.getItem("token");
//       if (!token) {
//         console.warn("Token not found! Stats cannot be fetched.");
//         setError("Token not found. Please login.");
//         setLoading(false);
//         return;
//       }

//       // const headers = { Authorization: `Bearer ${token}` };

//       try {
//         // Fetch all stats
//         // const products = await apiFetch(API.products(), "GET", null, { headers });
//         // const tracked = await apiFetch(API.trackedProducts(), "GET", null, { headers });
//         // const users = await apiFetch(API.users(), "GET", null, { headers });

//         // // Log responses for debugging
//         // console.log("Products raw:", products);
//         // console.log("Tracked raw:", tracked);
//         // console.log("Users raw:", users);

//         // setRawData({ products, tracked, users });

//         // // Handle both direct arrays and { results: [...] } structure
//         // const getLength = (data) => {
//         //   if (!data) return 0;
//         //   if (Array.isArray(data)) return data.length;
//         //   if (data.results && Array.isArray(data.results)) return data.results.length;
//         //   return 0;
//         // };

//         // setStats({
//         //   products: getLength(products),
//         //   tracked: getLength(tracked),
//         //   users: getLength(users),
//         // });

//         const res = await fetch(API.dashboardStats(), {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         if (!res.ok) {
//           const errData = await res.json();
//           throw new Error(errData.detail || "Failed to fetch stats");
//         }
//         const data = await res.json();
//         console.log("Dashboard stats response:", data);
//         setStats({
//           products: data.products ?? 0,
//           tracked: data.tracked ?? 0,
//           users: data.users ?? 0,
//         });

//       } catch (err) {
//         console.error("Failed to fetch stats:", err);
//         setError("Failed to fetch stats. Check console for details.");
//         // setRawData({ products: null, tracked: null, users: null });
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchStats();
//   }, []);

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

//       {loading && <p className="text-gray-500 mb-4">Loading stats...</p>}
//       {error && <p className="text-red-500 mb-4">{error}</p>}

//       {/* Dashboard counts */}
//       <div className="grid grid-cols-3 gap-4 mb-6">
//         <div className="bg-white p-4 shadow rounded">
//           Products: {stats.products ?? "N/A"}
//         </div>
//         <div className="bg-white p-4 shadow rounded">
//           Tracked Products: {stats.tracked ?? "N/A"}
//         </div>
//         <div className="bg-white p-4 shadow rounded">
//           Users: {stats.users ?? "N/A"}
//         </div>
//       </div>

//       {/* Raw API data */}
//       {/* <h2 className="text-xl font-semibold mb-2">Raw API Data (Debug)</h2> */}
//       {/* <div className="bg-gray-100 p-4 rounded overflow-x-auto">
//         <pre>{JSON.stringify(rawData, null, 2)}</pre>
//       </div> */}
//     </div>
//   );
// }

// --------------------
// Theme 01 
// ----------------------

// // src/pages/Admin/Dashboard.js
// import { useEffect, useState } from "react";
// import { API } from "../../utils/api";

// export default function Dashboard() {
//   const [stats, setStats] = useState({ products: 0, users: 0, tracked_items: 0 });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [availableEndpoints, setAvailableEndpoints] = useState([]);

//   useEffect(() => {
//     async function fetchStats() {
//       console.log("🔄 Dashboard: Starting to fetch stats...");
      
//       setLoading(true);
//       setError(null);

//       const token = localStorage.getItem("token");
      
//       if (!token) {
//         setError("Please login to view dashboard");
//         setLoading(false);
//         return;
//       }

//       try {
//         // Let's try multiple possible endpoints since /dashboard/stats/ doesn't exist
//         const endpointsToTry = [
//           // Try the products endpoint first to get product count
//           { name: 'products', url: API.products() },
//           { name: 'users', url: API.users() },
//           { name: 'tracked', url: API.adminTrackedProducts() },
//         ];

//         console.log("🔍 Testing available endpoints...");
        
//         const results = {};
//         const available = [];

//         for (const endpoint of endpointsToTry) {
//           try {
//             console.log(`📡 Testing: ${endpoint.name} -> ${endpoint.url}`);
//             const response = await fetch(endpoint.url, {
//               method: "GET",
//               headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${token}`,
//               },
//             });

//             if (response.ok) {
//               const data = await response.json();
//               results[endpoint.name] = data;
//               available.push(endpoint.name);
//               console.log(`✅ ${endpoint.name}: Success`, data);
//             } else {
//               console.log(`❌ ${endpoint.name}: ${response.status}`);
//             }
//           } catch (err) {
//             console.log(`❌ ${endpoint.name}: Error`, err.message);
//           }
//         }

//         setAvailableEndpoints(available);
//         console.log("📊 Available endpoints:", available);
//         console.log("📊 Results:", results);

//         // Calculate stats from available data
//         const calculatedStats = {
//           products: results.products?.length || results.products?.count || 0,
//           users: results.users?.length || results.users?.count || 0,
//           tracked_items: results.tracked?.length || results.tracked?.count || 0,
//         };

//         console.log("📈 Calculated stats:", calculatedStats);
//         setStats(calculatedStats);

//       } catch (err) {
//         console.error("💥 Dashboard fetch error:", err);
//         setError(`Failed to load dashboard: ${err.message}`);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchStats();
//   }, []);

//   // Check if user is admin
//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   const isAdmin = user.is_admin || user.is_superuser || user.is_staff;

//   if (!isAdmin) {
//     return (
//       <div className="p-6">
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
//           <strong>Access Denied:</strong> Admin privileges required to view this page.
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

//       {/* Available Endpoints Info */}
//       {availableEndpoints.length > 0 && (
//         <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
//           <strong>Available Endpoints:</strong> {availableEndpoints.join(", ")}
//         </div>
//       )}

//       {loading && (
//         <div className="text-center py-8">
//           <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//           <p className="mt-2 text-gray-600">Loading dashboard stats...</p>
//         </div>
//       )}

//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           <strong>Error:</strong> {error}
//         </div>
//       )}

//       {!loading && !error && (
//         <>
//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//             <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
//               <div className="flex items-center">
//                 <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
//                   📦
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Products</p>
//                   <p className="text-2xl font-bold text-gray-900">{stats.products}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
//               <div className="flex items-center">
//                 <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
//                   👥
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Total Users</p>
//                   <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
//               <div className="flex items-center">
//                 <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
//                   🔔
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-600">Tracked Items</p>
//                   <p className="text-2xl font-bold text-gray-900">{stats.tracked_items}</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Quick Actions */}
//           <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
//             <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//               <button 
//                 onClick={() => window.location.href = '/admin/products'}
//                 className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-200"
//               >
//                 View Products
//               </button>
//               <button 
//                 onClick={() => window.location.href = '/admin/users'}
//                 className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition duration-200"
//               >
//                 Manage Users
//               </button>
//               <button 
//                 onClick={() => window.location.href = '/admin/tracked'}
//                 className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition duration-200"
//               >
//                 Tracked Items
//               </button>
//               <button 
//                 onClick={() => window.location.href = '/admin/price-history'}
//                 className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition duration-200"
//               >
//                 Price History
//               </button>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }



// // -----------------------
// // Theme 02
// // -----------------------

import { useEffect, useState } from "react";
import { API } from "../../utils/api";
import { apiFetch } from "../../utils/fetcher";
import { useAuth } from "../../context/AuthContext";

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, users: 0, tracked_items: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchStats() {
      console.log("🔄 Dashboard: Starting to fetch stats...");
      
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Please login to view dashboard");
        setLoading(false);
        return;
      }

      try {
        // Use the dashboard stats endpoint if it exists, otherwise fetch individual endpoints
        try {
          // First try the dedicated dashboard stats endpoint
          const dashboardRes = await fetch(API.dashboardStats(), {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });
          if (dashboardRes.ok) {
            const data = await dashboardRes.json();
            console.log("✅ Dashboard stats from dedicated endpoint:", data);
            setStats({
              products: data.products ?? 0,
              users: data.users ?? 0,
              tracked_items: data.tracked_items ?? 0,
            });
            return; // Success, exit early
          }
        } catch (dashboardErr) {
          console.log("❌ Dashboard endpoint not available, trying individual endpoints...");
        }

        // Fallback: Fetch individual endpoints
        console.log("🔍 Fetching stats from individual endpoints...");
        
        const endpoints = [
          { name: 'products', url: API.products() },
          { name: 'users', url: API.users() },
          { name: 'tracked', url: API.adminTrackedProducts() }, // Use trackedProducts instead of adminTrackedProducts
        ];

        const results = {};

        for (const endpoint of endpoints) {
          try {
            console.log(`📡 Fetching: ${endpoint.name} -> ${endpoint.url}`);
            const data = await apiFetch(endpoint.url, "GET");
            // Handle different response formats
            if (Array.isArray(data)) {
              results[endpoint.name] = data.length;
            } else if (data.results && Array.isArray(data.results)) {
              results[endpoint.name] = data.results.length;
            } else if (data.count !== undefined) {
              results[endpoint.name] = data.count;
            } else {
              results[endpoint.name] = 0;
            }
            
            console.log(`✅ ${endpoint.name}: ${results[endpoint.name]}`);
          } catch (err) {
            console.log(`❌ ${endpoint.name}: Error`, err.message);
            results[endpoint.name] = 0;
          }
        }

        console.log("📊 Final results:", results);
        setStats({
          products: results.products || 0,
          users: results.users || 0,
          tracked_items: results.tracked || 0,
        });

      } catch (err) {
        console.error("💥 Dashboard fetch error:", err);
        setError(`Failed to load dashboard: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  // Check if user is admin using AuthContext
  const isAdmin = user?.is_admin || user?.is_superuser || user?.is_staff;

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Access Denied:</strong> Admin privileges required to view this page.
          <div className="mt-2 text-sm">
            <p>Current user: {user?.username || "Not logged in"}</p>
            <p>Admin status: {isAdmin ? "Yes" : "No"}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="text-sm text-gray-600">
          Welcome, {user?.username || "Admin"}
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard stats...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.products}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.users}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Tracked Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.tracked_items}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={() => window.location.href = '/admin/products'}
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                View Products
              </button>
              <button 
                onClick={() => window.location.href = '/admin/users'}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Manage Users
              </button>
              <button 
                onClick={() => window.location.href = '/admin/tracked'}
                className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Tracked Items
              </button>
              <button 
                onClick={() => window.location.href = '/admin/price-history'}
                className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Price History
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}