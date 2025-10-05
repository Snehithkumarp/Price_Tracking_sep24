// // ==============================
// // 📦 Product Detail Page
// // ==============================
// // Shows a single product's details, price, price history chart, and allows setting price alerts

// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ResponsiveContainer,
// } from "recharts";
// import { API, API_BASE } from "../../utils/api";
// import { apiFetch } from "../../utils/fetcher";

// export default function ProductDetailPage() {
//   // 🏷 Get product ID from URL params
//   const { id } = useParams();

//   // ==============================
//   // 🔹 Local State
//   // ==============================
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [product, setProduct] = useState(null);
//   const [history, setHistory] = useState([]);
//   const [alertPrice, setAlertPrice] = useState("");
//   const [message, setMessage] = useState("");
//   const [alerts, setAlerts] = useState([]);
//   const [repeat, setRepeat] = useState(false); // 🔹 new for repeat alerts

//   const token = localStorage.getItem("token");

//   // ==============================
//   // 🔹 Fetch product details, price history, and user alerts
//   // ==============================
//   // useEffect(() => {
//   //   let mounted = true; // prevent state update if component unmounts

//   //   const fetchData = async () => {
//   //     setLoading(true);
//   //     setError("");

//   //     try {
//   //       // Fetch product info + price history in parallel
//   //       const [p, h] = await Promise.all([
//   //         apiFetch(API.product(id)),
//   //         apiFetch(API.priceHistory(id)),
//   //       ]);
//   //       if (!mounted) return;

//   //       setProduct(p);

//   //       // Normalize history to array and format dates
//   //       const rawHistory = Array.isArray(h?.results) ? h.results : h;
//   //       setHistory(
//   //         rawHistory.map((item) => ({
//   //           ...item,
//   //           date: new Date(item.date).toLocaleDateString(),
//   //         }))
//   //       );

//   //       // If logged in, fetch user's alerts for this product
//   //       if (token) {
//   //         const userAlerts = await apiFetch(API.alerts.list(), token, "GET");
//   //         setAlerts(userAlerts.filter((a) => a.product === p.id));
//   //       }
//   //     } catch (err) {
//   //       if (!mounted) return;
//   //       const msg =
//   //         err.response?.data?.detail || err.message || "Failed to load product";
//   //       setError(msg);
//   //     } finally {
//   //       if (mounted) setLoading(false);
//   //     }
//   //   };

//   //   fetchData();
//   //   return () => {
//   //     mounted = false; // cleanup
//   //   };
//   // }, [id, token]);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         console.log("Fetching product:", API.product(id));
//         const p = await apiFetch(API.product(id));
//         console.log("Product data:", p);
//         console.log("Product history:", p.history);

//         setHistory(
//           p.history?.map((item) => ({
//             ...item,
//             // date: new Date(item.date).toLocaleDateString(),
//             date: item.date,
//             price: Number(item.price),
//           }))
//           .sort((a, b) => new Date(a.date) - new Date(b.date)) // 🔹 sort old → new
//         );
//         setLoading(false);
//         setProduct(p);
//       } catch (err) {
//         console.error("Fetch product failed:", err);
//         setError(err.message);
//       }
//     };
//     fetchData();
//   }, [id]);

//   // ==============================
//   // 🔹 Handle setting a price alert
//   // ==============================
//   const handleSetAlert1 = async (e) => {
//     e.preventDefault();

//     if (!token) {
//       setMessage("❌ You must be logged in to set alerts.");
//       return;
//     }

//     console.log(
//       "Hiiiiiiiiiiiiii========> ",
//       product.id,
//       Number(alertPrice),
//       token
//     );

//     try {
//       // await apiFetch(API.alerts.create(), token, "POST", {
//       //   product: product.id,
//       //   threshold: Number(alertPrice),
//       //   active: true,
//       // });

//       await apiFetch(
//         API.alerts.create(),
//         "POST",
//         {
//           product: product.id,
//           threshold: Number(alertPrice),
//           active: true,
//         },
//         token
//       );

//       await apiFetch(
//         `${API_BASE}/api/tracked/${product.id}/set_alert/`,
//         "POST",
//         { threshold: Number(alertPrice) },
//         token
//       );

//       setMessage("✅ Price alert set successfully!");
//       setAlertPrice("");

//       // Refresh alerts after setting
//       // const userAlerts = await apiFetch(API.alerts.list(), token, "GET");
//       const userAlerts = await apiFetch(API.alerts.list(), "GET");
//       console.log("User Alerts  ==> ", userAlerts);

//       setAlerts(userAlerts.filter((a) => a.product === product.id));
//     } catch (err) {
//       const { Error } = err;
//       console.log("err alerts ==> ", err);

//       const msg =
//         err?.Error?.detail ||
//         err.response?.data?.detail ||
//         err.message ||
//         "❌ Failed to set alert.";
//       console.log("msg ==> ", msg);

//       setMessage(msg);
//     } finally {
//       // Clear message after 4s
//       setTimeout(() => setMessage(""), 9999);
//     }
//   };

//   const handleSetAlert2 = async (e) => {
//     e.preventDefault();

//     if (!token) {
//       setMessage("❌ You must be logged in to set alerts.");
//       return;
//     }

//     try {
//       // -----------------------------
//       // Step 1: Create or update tracked product with threshold + repeat option
//       // -----------------------------
//       console.log("req 1");

//       const req1 = await apiFetch(
//         `${API_BASE}/api/tracked/`,
//         "POST", // let backend handle create_or_update
//         {
//           product_id: product.id,
//           threshold: Number(alertPrice),
//           active: true,
//           repeat_alerts: repeat, // 👈 checkbox value
//         },
//         token
//       );
//       console.log("Tracked product response:", req1);

//       const trackedId = req1.id; // 👈 use the tracked product ID

//       // -----------------------------
//       // Step 2: Set alert on tracked product
//       // -----------------------------
//       const req2 = await apiFetch(
//         `${API_BASE}/api/tracked/${trackedId}/set-alert/`,
//         "POST",
//         { threshold: Number(alertPrice) },
//         token
//       );

//       console.log("req2 ==> ", req2);

//       setMessage("✅ Price alert set successfully!");
//       setAlertPrice("");

//       // -----------------------------
//       // Step 3: Refresh tracked products for user
//       // -----------------------------
//       const userTracked = await apiFetch(
//         `${API_BASE}/api/tracked/`,
//         "GET",
//         null,
//         token
//       );
//       console.log("User tracked products ==> ", userTracked);
//       const productAlerts = userTracked
//         .filter((t) => t.product.id === product.id)
//         .map((t) => ({
//           id: t.id,
//           threshold: t.threshold,
//           active: t.active,
//         }));
//       setAlerts(productAlerts);
      
//       // setTracked(userTracked);
//     } catch (err) {
//       console.log("Error setting alert ==> ", err);
//       const msg =
//         err?.Error?.detail ||
//         err.response?.data?.detail ||
//         err.message ||
//         "❌ Failed to set alert.";
//       setMessage(msg);
//     } finally {
//       setTimeout(() => setMessage(""), 9999);
//     }
//   };

//   const handleSetAlert = async (e) => {
//   e.preventDefault();
//   if (!token) {
//     setMessage("❌ You must be logged in to set alerts.");
//     return;
//   }

//   try {
//     const res = await fetch(`${API_BASE}/api/tracked/`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({
//         product_id: product.id,
//         threshold: Number(alertPrice),
//         active: true,
//         repeat_alerts: repeat,
//       }),
//     });

//     const data = await res.json(); // parse JSON even if error
//     if (!res.ok) {
//       // Display backend error
//       setMessage(data.detail || "❌ Failed to set alert.");
//       return;
//     }

//     const trackedId = data.id;

//     // Set alert on tracked product
//     const alertRes = await fetch(`${API_BASE}/api/tracked/${trackedId}/set-alert/`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ threshold: Number(alertPrice) }),
//     });

//     const alertData = await alertRes.json();
//     if (!alertRes.ok) {
//       setMessage(alertData.detail || "❌ Failed to set alert.");
//       return;
//     }

//     setMessage("✅ Price alert set successfully!");
//     setAlertPrice("");

//     // Refresh tracked products
//     const trackedListRes = await fetch(`${API_BASE}/api/tracked/`, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     const trackedList = await trackedListRes.json();
//     const productAlerts = trackedList
//       .filter((t) => t.product.id === product.id)
//       .map((t) => ({ id: t.id, threshold: t.threshold, active: t.active }));
//     setAlerts(productAlerts);

//   } catch (err) {
//     console.error("Error setting alert:", err);
//     setMessage("❌ Failed to set alert.");
//   } finally {
//     setTimeout(() => setMessage(""), 9999);
//   }
// };


//   const currency = product?.currency || "₹";

//   // ==============================
//   // 🔹 Loading/Error States
//   // ==============================
//   if (loading)
//     return <div className="text-sm text-gray-500">Loading product…</div>;
//   if (error) return <div className="text-red-600">{error}</div>;

//   if (loading) {
//     return (
//       <div className="p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">Product Detail</h1>
//         </div>
//         <div className="text-center py-12">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           <p className="mt-4 text-gray-600">Loading products details...</p>
//         </div>
//       </div>
//     );
//   }

//   // ==============================
//   // 🔹 Render Product Details
//   // ==============================
//   return (
//     <div className="mx-auto max-w-6xl px-4 py-8">
//       <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//         {/* Product Image */}
//         <div className="rounded-2xl border bg-white p-3 shadow-sm">
//           <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
//             {product.image_url ? (
//               <img
//                 src={product.image_url}
//                 alt={product.title}
//                 className="h-full w-full object-cover"
//               />
//             ) : (
//               <div className="flex h-full w-full items-center justify-center text-gray-400">
//                 No image
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Product Details */}
//         <div className="flex flex-col gap-4">
//           <h1 className="text-2xl font-bold leading-tight">{product.title}</h1>
//           <div className="text-3xl font-black">
//             {currency}
//             {product.current_price}
//           </div>
//           {product.last_checked && (
//             <div className="text-xs text-gray-500">
//               Last checked: {new Date(product.last_checked).toLocaleString()}
//             </div>
//           )}

//           {product.product_url && (
//             <div className="rounded-2xl border bg-white p-4 shadow-sm">
//               <a
//                 href={product.product_url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700"
//               >
//                 🛒 View Product on Store
//               </a>
//               <p className="mt-2 text-center text-xs text-gray-500">
//                 Redirects to the original seller site
//               </p>
//             </div>
//           )}

//           {/* Price Alert Form */}
//           <div className="rounded-2xl border bg-white p-4 shadow-sm">
//             <h2 className="mb-2 text-sm font-semibold text-gray-700">
//               Set Price Alert
//             </h2>
//             <form onSubmit={handleSetAlert} className="flex gap-2">
//               <input
//                 type="number"
//                 placeholder="Enter target price"
//                 value={alertPrice}
//                 onChange={(e) => setAlertPrice(e.target.value)}
//                 required
//                 className="flex-1 rounded border px-3 py-2 text-sm"
//               />

//               {/* 🔹 Repeat Alerts Checkbox */}
//               <label className="flex items-center gap-2 text-sm">
//                 <input
//                   type="checkbox"
//                   checked={repeat}
//                   onChange={(e) => setRepeat(e.target.checked)}
//                   className="h-4 w-4 rounded border-gray-300"
//                 />
//                 Send multiple alerts (repeat)
//               </label>

//               <button
//                 type="submit"
//                 className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
//               >
//                 Set
//               </button>
//             </form>
//             {message && <p className="mt-2 text-sm">{message}</p>}
//             {alerts.length > 0 && (
//               <ul className="mt-3 space-y-1 text-sm text-gray-600">
//                 {alerts.map((a) => (
//                   <li key={a.id}>
//                     Alert at {currency}
//                     {a.threshold} → {a.active ? "🟢 Active" : "🔴 Triggered"}
//                   </li>
//                 ))}
//               </ul>
//             )}
//           </div>

//           {/* Price History Chart */}
//           <div className="rounded-2xl border bg-white p-4 shadow-sm">
//             <h2 className="mb-2 text-sm font-semibold text-gray-700">
//               Price history
//             </h2>
//             {history.length > 0 ? (
//               <div className="h-64 w-full">
//                 {/* <ResponsiveContainer width="100%" height="100%">
//                   <LineChart
//                     data={history}
//                     margin={{ top: 8, right: 12, bottom: 8, left: 0 }}
//                   >
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="date" tick={{ fontSize: 12 }} />
//                     <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
//                     <Tooltip formatter={(v) => `${currency}${v}`} />
//                     <Line
//                       type="monotone"
//                       dataKey="price"
//                       strokeWidth={2}
//                       dot={false}
//                     />
//                   </LineChart>
//                 </ResponsiveContainer> */}

//                 <ResponsiveContainer width="100%" height="100%">
//   <LineChart data={history} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
//     <CartesianGrid strokeDasharray="3 3" />
//     <XAxis
//       dataKey="date"
//       tickFormatter={(d) => new Date(d).toLocaleDateString()}
//       tick={{ fontSize: 12 }}
//     />
//     <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
//     <Tooltip
//       formatter={(v) => `${currency}${v}`}
//       labelFormatter={(label) => new Date(label).toLocaleString()}
//     />
//     <Line
//       type="monotone"
//       dataKey="price"
//       strokeWidth={2}
//       dot={false}
//       stroke="#4F46E5"
//     />
//   </LineChart>
// </ResponsiveContainer>



//               </div>
//             ) : (
//               <div className="text-sm text-gray-500">No history yet.</div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// ------------------------
// theme 02
// ----------------------

// ==============================
// 📦 Product Detail Page
// ==============================
// Shows a single product's details, price, price history chart, and allows setting price alerts

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { API, API_BASE } from "../../utils/api";
import { apiFetch } from "../../utils/fetcher";
import { useAuth } from "../../context/AuthContext";

export default function ProductDetailPage() {
  const { id } = useParams();
  const { token, user } = useAuth();

  // ==============================
  // 🔹 Local State
  // ==============================
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [alertPrice, setAlertPrice] = useState("");
  const [message, setMessage] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [repeat, setRepeat] = useState(false);
  const [isSettingAlert, setIsSettingAlert] = useState(false);

  // ==============================
  // 🔹 Fetch product details and price history
  // ==============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        console.log("Fetching product:", API.product(id));
        const productData = await apiFetch(API.product(id));
        console.log("Product data:", productData);

        // Process price history
        const priceHistory = productData.history || [];
        const processedHistory = priceHistory
          .map((item) => ({
            ...item,
            date: item.date,
            price: Number(item.price),
            formattedDate: new Date(item.date).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

        setProduct(productData);
        setHistory(processedHistory);

        // Fetch user's alerts if logged in
        if (token) {
          await fetchUserAlerts(productData.id);
        }

      } catch (err) {
        console.error("Fetch product failed:", err);
        setError(err.message || "Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  // ==============================
  // 🔹 Fetch user's alerts for this product
  // ==============================
  const fetchUserAlerts = async (productId) => {
    try {
      const userTracked = await apiFetch(API.trackedProducts(), "GET");
      const productAlerts = userTracked
        .filter((t) => t.product?.id === productId)
        .map((t) => ({
          id: t.id,
          threshold: t.threshold,
          active: t.active,
          repeat_alerts: t.repeat_alerts || false
        }));
      setAlerts(productAlerts);
    } catch (err) {
      console.error("Failed to fetch alerts:", err);
    }
  };

  // ==============================
  // 🔹 Handle setting a price alert
  // ==============================
  const handleSetAlert = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setMessage("❌ Please log in to set price alerts");
      setTimeout(() => setMessage(""), 4000);
      return;
    }

    if (!alertPrice || isNaN(alertPrice) || parseFloat(alertPrice) <= 0) {
      setMessage("❌ Please enter a valid price");
      setTimeout(() => setMessage(""), 4000);
      return;
    }

    setIsSettingAlert(true);
    setMessage("");

    try {
      // Step 1: Create or update tracked product
      const trackedResponse = await fetch(`${API_BASE}/api/tracked/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id,
          threshold: Number(alertPrice),
          active: true,
          repeat_alerts: repeat,
        }),
      });

      const trackedData = await trackedResponse.json();
      
      if (!trackedResponse.ok) {
        throw new Error(trackedData.detail || "Failed to create tracking");
      }

      const trackedId = trackedData.id;

      // Step 2: Set alert on tracked product
      const alertResponse = await fetch(`${API_BASE}/api/tracked/${trackedId}/set-alert/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ threshold: Number(alertPrice) }),
      });

      if (!alertResponse.ok) {
        const alertError = await alertResponse.json();
        throw new Error(alertError.detail || "Failed to set alert");
      }

      setMessage("✅ Price alert set successfully!");
      setAlertPrice("");
      setRepeat(false);

      // Refresh alerts
      await fetchUserAlerts(product.id);

    } catch (err) {
      console.error("Error setting alert:", err);
      setMessage(`❌ ${err.message || "Failed to set alert"}`);
    } finally {
      setIsSettingAlert(false);
      setTimeout(() => setMessage(""), 6000);
    }
  };

  // ==============================
  // 🔹 Calculate price statistics
  // ==============================
  const priceStats = history.length > 0 ? {
    lowest: Math.min(...history.map(h => h.price)),
    highest: Math.max(...history.map(h => h.price)),
    average: (history.reduce((sum, h) => sum + h.price, 0) / history.length).toFixed(2),
    changes: history.length - 1
  } : null;

  // ==============================
  // 🔹 Loading State
  // ==============================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Product Details</h1>
          </div>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // 🔹 Error State
  // ==============================
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => window.history.back()} className="text-red-700 hover:text-red-900">
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            Product not found
          </div>
        </div>
      </div>
    );
  }

  const currency = product?.currency || "₹";

  // ==============================
  // 🔹 Render Product Details
  // ==============================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Back to Home
          </Link>
        </nav>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column - Product Image & Basic Info */}
          <div className="space-y-6">
            {/* Product Image */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="h-full w-full object-fill"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="hidden h-full w-full items-center justify-center text-gray-400">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm">No image available</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Stats */}
            {priceStats && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{currency}{priceStats.lowest}</div>
                    <div className="text-sm text-gray-500">Lowest</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{currency}{priceStats.highest}</div>
                    <div className="text-sm text-gray-500">Highest</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{currency}{priceStats.average}</div>
                    <div className="text-sm text-gray-500">Average</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{priceStats.changes}</div>
                    <div className="text-sm text-gray-500">Changes</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Product Details & Actions */}
          <div className="space-y-6">
            {/* Product Header */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                {product.title}
              </h1>
              
              {product.sku && (
                <p className="text-sm text-gray-500 mb-4">SKU: {product.sku}</p>
              )}

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-3xl font-black text-gray-900">
                  {currency}{product.current_price}
                </span>
                <span className="text-sm text-green-600 font-semibold">Current Price</span>
              </div>

              {product.last_checked && (
                <div className="text-xs text-gray-500">
                  Last checked: {new Date(product.last_checked).toLocaleString()}
                </div>
              )}
            </div>

            {/* Store Link */}
            {product.product_url && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <a
                  href={product.product_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 text-base font-semibold text-white shadow-md transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg"
                >
                  <span>🛒</span>
                  View Product on Store
                </a>
                <p className="mt-3 text-center text-sm text-gray-500">
                  Redirects to the original seller website
                </p>
              </div>
            )}

            {/* Price Alert Form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Set Price Alert
              </h2>
              
              {!token ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-3">Please log in to set price alerts</p>
                  <Link 
                    to="/login" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSetAlert} className="space-y-4">
                  <div>
                    <label htmlFor="alertPrice" className="block text-sm font-medium text-gray-700 mb-2">
                      Alert me when price drops below:
                    </label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          id="alertPrice"
                          type="number"
                          step="0.01"
                          placeholder="Enter target price"
                          value={alertPrice}
                          onChange={(e) => setAlertPrice(e.target.value)}
                          required
                          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSettingAlert || !alertPrice}
                        className="rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {isSettingAlert ? (
                          <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Setting...
                          </div>
                        ) : (
                          'Set Alert'
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="repeatAlerts"
                      type="checkbox"
                      checked={repeat}
                      onChange={(e) => setRepeat(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="repeatAlerts" className="ml-2 text-sm text-gray-700">
                      Send multiple alerts for continued price drops
                    </label>
                  </div>

                  {message && (
                    <div className={`p-3 rounded-lg text-sm ${
                      message.includes('❌') 
                        ? 'bg-red-100 text-red-700 border border-red-200' 
                        : 'bg-green-100 text-green-700 border border-green-200'
                    }`}>
                      {message}
                    </div>
                  )}

                  {alerts.length > 0 && (
                    <div className="border-t pt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Your Alerts:</h3>
                      <ul className="space-y-2">
                        {alerts.map((a) => (
                          <li key={a.id} className="flex items-center justify-between text-sm">
                            <span>Alert at {currency}{a.threshold}</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              a.active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {a.active ? '🟢 Active' : '🔴 Inactive'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Price History Chart */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Price History
              </h2>
              {history.length > 0 ? (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(d) => new Date(d).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short'
                        })}
                        tick={{ fontSize: 12 }}
                        stroke="#6b7280"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }} 
                        domain={["auto", "auto"]} 
                        stroke="#6b7280"
                        tickFormatter={(value) => `${currency}${value}`}
                      />
                      <Tooltip
                        formatter={(value) => [`${currency}${value}`, 'Price']}
                        labelFormatter={(label) => new Date(label).toLocaleString('en-IN', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        strokeWidth={3}
                        dot={false}
                        stroke="#4F46E5"
                        activeDot={{ r: 6, fill: '#4F46E5' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-2">No price history available yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
