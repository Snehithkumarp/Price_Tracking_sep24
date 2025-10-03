// // ==============================
// // 📊 Admin - Price History Page
// // ==============================
// import { useParams } from "react-router-dom";

// import { useEffect, useState } from "react";
// import { apiFetch, API } from "../../utils/api";




// export default function PriceHistory() {
//   const { productId } = useParams(); // get productId from URL
//   const [history, setHistory] = useState([]);
//   const [search, setSearch] = useState("");
//   const [dateFilter, setDateFilter] = useState("");

//   useEffect(() => {
//   async function fetchHistory() {
//     const token = localStorage.getItem("token");
//     const headers = { Authorization: `Bearer ${token}` };
//     const data = await apiFetch(API.priceHistory(productId), "GET", null, { headers });
//     setHistory(data);
//   }
//   fetchHistory();
// }, [productId]);

//   // Apply search + date filter
//   const filteredHistory = history.filter((item) => {
//     const matchesSearch = item.product.title
//       .toLowerCase()
//       .includes(search.toLowerCase());
//     const matchesDate = dateFilter ? item.date.startsWith(dateFilter) : true;
//     return matchesSearch && matchesDate;
//   });

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4">Price History</h1>

//       {/* Filters */}
//       <div className="flex gap-4 mb-4">
//         <input
//           type="text"
//           placeholder="Search by product name..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="border px-3 py-2 rounded w-1/3"
//         />
//         <input
//           type="date"
//           value={dateFilter}
//           onChange={(e) => setDateFilter(e.target.value)}
//           className="border px-3 py-2 rounded"
//         />
//       </div>

//       {/* Table */}
//       <table className="w-full border-collapse bg-white shadow rounded">
//         <thead>
//           <tr className="bg-gray-100 text-left">
//             <th className="p-3 border">Product</th>
//             <th className="p-3 border">Price</th>
//             <th className="p-3 border">Date</th>
//           </tr>
//         </thead>
//         <tbody>
//           {filteredHistory.map((item) => (
//             <tr key={item.id} className="hover:bg-gray-50">
//               <td className="p-3 border">{item.product.title}</td>
//               <td className="p-3 border">₹{item.price}</td>
//               <td className="p-3 border">
//                 {new Date(item.date).toLocaleString()}
//               </td>
//             </tr>
//           ))}
//           {filteredHistory.length === 0 && (
//             <tr>
//               <td colSpan="3" className="p-4 text-center text-gray-500">
//                 No price history found.
//               </td>
//             </tr>
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// }



// ==============================
// 📊 Admin - Price History Page
// ==============================
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch, API } from "../../utils/api";

export default function AdminPriceHistoryPage() {
  const { productId } = useParams(); // get productId from URL
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [productInfo, setProductInfo] = useState(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true);
        setError(null);
        
        let priceHistoryData = [];
        
        if (productId) {
          // Safe: Only fetch all history and filter frontend OR implement API with productId
          const data = await apiFetch(API.adminPriceHistory(), "GET");
          priceHistoryData = data.results || data || [];

          // Also fetch product details
          try {
            const productData = await apiFetch(API.product(productId), "GET");
            setProductInfo(productData);
          // Replace product field in every history item with full product info
            priceHistoryData = priceHistoryData
              .filter((item) => item.product?.id == productId)
              .map((item) => ({ ...item, product: productData }));
          } catch (err) {
            console.error("Could not fetch product details:", err);
          }
        } else {
          // Fetch all price history
          const data = await apiFetch(API.adminPriceHistory(), "GET");
          priceHistoryData = data.results || data || [];
        }
        
        console.log("Price history data:", priceHistoryData);
        setHistory(Array.isArray(priceHistoryData) ? priceHistoryData : []);
        
      } catch (err) {
        console.error("Failed to fetch price history:", err);
        setError("Failed to load price history. Please check if the endpoint is correct.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchHistory();
  }, [productId]);

  // Apply search + date filter
  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.product?.title
      ?.toLowerCase()
      .includes(search.toLowerCase()) ?? true;
    
    const matchesDate = dateFilter 
      ? item.date?.startsWith(dateFilter) ?? true
      : true;
    
    return matchesSearch && matchesDate;
  });

  // Stats
  const stats = {
    totalEntries: filteredHistory.length,
    priceChanges:
      filteredHistory.length > 1
        ? filteredHistory.filter((item, index, array) => 
            index > 0 && parseFloat(item.price) !== parseFloat(array[index - 1].price)
          ).length
        : 0,
    currentPrice:
      filteredHistory.length > 0 ? parseFloat(filteredHistory[0].price) : 0,
    lowestPrice:
      filteredHistory.length > 0
        ? Math.min(...filteredHistory.map((item) => parseFloat(item.price)))
        : 0,
    highestPrice:
      filteredHistory.length > 0
        ? Math.max(...filteredHistory.map((item) => parseFloat(item.price)))
        : 0,
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Price History</h1>
        </div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading price history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Price History</h1>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Price History</h1>
          <p className="text-gray-600 mt-1">
            {productId && productInfo 
              ? `Tracking price changes for: ${productInfo.title}`
              : `${stats.totalEntries} price records across all products`
            }
          </p>
        </div>
      </div>

      {/* Product Info Card (if viewing specific product) */}
      {productId && productInfo && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
          <div className="flex items-center">
            {productInfo.image_url && (
              <img
                src={productInfo.image_url}
                alt={productInfo.title}
                className="h-16 w-16 rounded-lg object-cover mr-4"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-gray-900">{productInfo.title}</h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span>SKU: {productInfo.sku || 'N/A'}</span>
                <span>•</span>
                <span>Current: <strong className="text-green-600">₹{productInfo.current_price}</strong></span>
                <span>•</span>
                <span>Last checked: {productInfo.last_checked ? new Date(productInfo.last_checked).toLocaleDateString() : 'Never'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {filteredHistory.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEntries}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Price Changes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.priceChanges}</p>
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
                <p className="text-sm font-medium text-gray-600">Lowest Price</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.lowestPrice}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Highest Price</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.highestPrice}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Products
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Date
            </label>
            <input
              id="date"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {(search || dateFilter) && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearch("");
                  setDateFilter("");
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition duration-200"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Recorded
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.map((item, index) => {
                const previousPrice = index < filteredHistory.length - 1 
                  ? parseFloat(filteredHistory[index + 1].price)
                  : null;
                const currentPrice = parseFloat(item.price);
                const priceDifference = previousPrice !== null ? currentPrice - previousPrice : null;
                const isPriceDrop = priceDifference !== null && priceDifference < 0;
                const isPriceIncrease = priceDifference !== null && priceDifference > 0;
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {item.product?.image_url && (
                          <img
                            src={item.product.image_url}
                            alt={item.product.title}
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate text-wrap">
                            {item?.product_name || "Unknown Product"}
                          </div>
                          {item.product?.sku && (
                            <div className="text-xs text-gray-500">
                              SKU: {item.product.sku}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600">
                        ₹{item.price}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.date 
                        ? new Date(item.date).toLocaleString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : "—"
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {priceDifference !== null ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          isPriceDrop 
                            ? 'bg-green-100 text-green-800'
                            : isPriceIncrease
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {isPriceDrop ? '↓' : isPriceIncrease ? '↑' : '→'}
                          {isPriceDrop || isPriceIncrease ? ` ₹${Math.abs(priceDifference).toFixed(2)}` : 'No change'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No price history found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {search || dateFilter 
                        ? 'Try adjusting your search or filter criteria.'
                        : 'No price tracking data available yet.'
                      }
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