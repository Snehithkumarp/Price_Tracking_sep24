// import { useEffect, useState } from "react";
// import { apiFetch, API } from "../../utils/api";

// export default function ProductsPage() {
//   const [products, setProducts] = useState([]);

//   // useEffect(() => {
//   //   API.get("/api/products/").then((res) => setProducts(res.data));
//   // }, []);
//   useEffect(() => {
//     async function fetchProducts() {
//       const token = localStorage.getItem("token");
//       const headers = { Authorization: `Bearer ${token}` };
//       const data = await apiFetch(API.products(), "GET", null, { headers });
//       setProducts(data);
//     }
//     fetchProducts();
//   }, []);

//   const deleteProduct = async (id) => {
//     const token = localStorage.getItem("token");
//     const headers = { Authorization: `Bearer ${token}` };

//     await apiFetch(API.product(id), "DELETE", null, { headers });

//     setProducts(products.filter((p) => p.id !== id));
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">Products</h2>
//       <table className="w-full border">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="p-2 border">Title</th>
//             <th className="p-2 border">Price</th>
//             <th className="p-2 border">Actions</th>
//           </tr>
//         </thead>
//         <tbody>
//           {products.map((p) => (
//             <tr key={p.id}>
//               <td className="p-2 border">
//                 <a href={p.product_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">
//                   {p.title}
//                 </a>
//               </td>
//               <td className="p-2 border">₹{p.current_price}</td>
//               <td className="p-2 border">
//                 <button
//                   onClick={() => deleteProduct(p.id)}
//                   className="bg-red-500 text-white px-3 py-1 rounded"
//                 >
//                   Delete
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }


// import { useEffect, useState } from "react";
// import { apiFetch, API } from "../../utils/api";

// export default function ProductsPage() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [deletingId, setDeletingId] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");

//   useEffect(() => {
//     async function fetchProducts() {
//       try {
//         setLoading(true);
//         setError(null);
//         const data = await apiFetch(API.products(), "GET");
//         setProducts(data.results || data);
//       } catch (err) {
//         console.error("Failed to fetch products:", err);
//         setError("Failed to load products. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchProducts();
//   }, []);

//   const deleteProduct = async (id) => {
//     if (!window.confirm("Are you sure you want to delete this product?")) {
//       return;
//     }

//     try {
//       setDeletingId(id);
//       await apiFetch(API.product(id), "DELETE");
//       setProducts(products.filter((p) => p.id !== id));
//     } catch (err) {
//       console.error("Failed to delete product:", err);
//       setError("Failed to delete product. Please try again.");
//     } finally {
//       setDeletingId(null);
//     }
//   };

//   const refreshProducts = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await apiFetch(API.products(), "GET");
//       setProducts(data.results || data);
//     } catch (err) {
//       console.error("Failed to refresh products:", err);
//       setError("Failed to refresh products. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Filter products based on search term
//   const filteredProducts = products.filter(product =>
//     product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
//   );

//   if (loading) {
//     return (
//       <div className="p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
//         </div>
//         <div className="text-center py-12">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           <p className="mt-4 text-gray-600">Loading products...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       {/* Header - Matching your screenshot style */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">Products Management</h1>
//         <p className="text-gray-600 text-lg">
//           Total {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} tracked
//         </p>
//       </div>

//       {/* Search and Actions Bar */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//         <div className="relative flex-1 max-w-md">
//           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//             <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//             </svg>
//           </div>
//           <input
//             type="text"
//             placeholder="Search products..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//           />
//         </div>
        
//         <div className="flex gap-3">
//           <button
//             onClick={refreshProducts}
//             className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition duration-200"
//           >
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//             </svg>
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* Error Message */}
//       {error && (
//         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
//           <div className="flex justify-between items-center">
//             <span>{error}</span>
//             <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Products List - Matching your screenshot layout */}
//       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//         {filteredProducts.length === 0 ? (
//           <div className="text-center py-16">
//             <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
//             </svg>
//             <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
//             <p className="mt-2 text-gray-500">
//               {searchTerm ? "Try adjusting your search terms" : "Get started by adding some products to track"}
//             </p>
//           </div>
//         ) : (
//           <div className="divide-y divide-gray-100">
//             {filteredProducts.map((product) => (
//               <div key={product.id} className="p-6 hover:bg-gray-50 transition duration-150">
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1 min-w-0">
//                     {/* Product Title */}
//                     <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                       {product.title}
//                     </h3>
                    
//                     {/* Product URL - Styled like your screenshot */}
//                     <div className="flex items-center gap-3 mb-3">
//                       <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
//                         {product.sku || 'No SKU'}
//                       </span>
//                       <a
//                         href={product.product_url}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="text-sm text-gray-500 hover:text-gray-700 truncate max-w-xs"
//                       >
//                         {product.product_url?.replace(/^https?:\/\//, '')}
//                       </a>
//                     </div>

//                     {/* Price and Details */}
//                     <div className="flex items-center gap-4 text-sm text-gray-600">
//                       <span className="font-semibold text-green-600 text-lg">
//                         {product.currency || '₹'}{product.current_price}
//                       </span>
//                       <span>•</span>
//                       <span>Last checked: {product.last_checked ? new Date(product.last_checked).toLocaleDateString() : 'Never'}</span>
//                     </div>
//                   </div>

//                   {/* Action Buttons */}
//                   <div className="flex items-center gap-3 ml-4">
//                     <button
//                       onClick={() => window.open(product.product_url, '_blank')}
//                       className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition duration-200"
//                     >
//                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
//                       </svg>
//                       View
//                     </button>
//                     <button
//                       onClick={() => deleteProduct(product.id)}
//                       disabled={deletingId === product.id}
//                       className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                       {deletingId === product.id ? (
//                         <>
//                           <div className="animate-spin rounded-full h-3 w-3 border-b-1 border-red-600"></div>
//                           Deleting...
//                         </>
//                       ) : (
//                         <>
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                           </svg>
//                           Delete
//                         </>
//                       )}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Quick Stats - Optional enhancement */}
//       {filteredProducts.length > 0 && (
//         <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
//           <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
//             <div className="flex items-center">
//               <div className="p-2 rounded-full bg-white text-blue-600 mr-3 shadow-sm">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
//                 </svg>
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-blue-700">Total Products</p>
//                 <p className="text-xl font-bold text-blue-900">{filteredProducts.length}</p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
//             <div className="flex items-center">
//               <div className="p-2 rounded-full bg-white text-green-600 mr-3 shadow-sm">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
//                 </svg>
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-green-700">Avg Price</p>
//                 <p className="text-xl font-bold text-green-900">
//                   ₹{(filteredProducts.reduce((sum, p) => sum + parseFloat(p.current_price), 0) / filteredProducts.length).toFixed(2)}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
//             <div className="flex items-center">
//               <div className="p-2 rounded-full bg-white text-purple-600 mr-3 shadow-sm">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//                 </svg>
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-purple-700">Tracked Items</p>
//                 <p className="text-xl font-bold text-purple-900">
//                   {products.reduce((sum, p) => sum + (p.tracked_by_count || 0), 0)}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
//             <div className="flex items-center">
//               <div className="p-2 rounded-full bg-white text-orange-600 mr-3 shadow-sm">
//                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                 </svg>
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-orange-700">Last Updated</p>
//                 <p className="text-lg font-bold text-orange-900">
//                   {new Date().toLocaleDateString()}
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


// 3rd

import { useEffect, useState } from "react";
import { apiFetch, API } from "../../utils/api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);
        const data = await apiFetch(API.products(), "GET");
        setProducts(data.results || data); // Handle both paginated and array responses
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      setDeletingId(id);
      await apiFetch(API.product(id), "DELETE");
      setProducts(products.filter((p) => p.id !== id));
      alert("Product deleted successfully!");
    } catch (err) {
      console.error("Failed to delete product:", err);
      setError("Failed to delete product. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const refreshProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch(API.products(), "GET");
      setProducts(data.results || data);
    } catch (err) {
      console.error("Failed to refresh products:", err);
      setError("Failed to refresh products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
        </div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600 mt-1">
            Total {products.length} product{products.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
        <button
          onClick={refreshProducts}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Error Message */}
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

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {products.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding some products to track.</p>
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Checked
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.image_url && (
                          <img
                            className="h-10 w-10 rounded-lg object-cover mr-3"
                            src={product.image_url}
                            alt={product.title}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <a
                            href={product.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-gray-900 hover:text-blue-600 transition duration-150 text-wrap"
                          >
                            {product.title}
                          </a>
                          <p className="text-xs text-gray-500 truncate max-w-xs">
                            {product.product_url?.replace(/^https?:\/\//, '')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                        {product.sku || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600">
                        {product.currency || '₹'}{product.current_price}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.last_checked ? new Date(product.last_checked).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => deleteProduct(product.id)}
                        disabled={deletingId === product.id}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingId === product.id ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-b-1 border-red-700"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {products.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600">Total Products</p>
                <p className="text-2xl font-bold text-blue-900">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-green-600">Average Price</p>
                <p className="text-2xl font-bold text-green-900">
                  ₹{(products.reduce((sum, p) => sum + parseFloat(p.current_price), 0) / products.length).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-purple-100 text-purple-600 mr-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-purple-600">Last Updated</p>
                <p className="text-lg font-bold text-purple-900">
                  {products.length > 0 
                    ? new Date(Math.max(...products.map(p => new Date(p.last_checked || p.created_at))))
                        .toLocaleDateString()
                    : 'Never'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}