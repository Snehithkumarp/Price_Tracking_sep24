// import { useCallback, useState, useEffect } from "react";
// import { API } from "../../utils/api";
// import { apiFetch } from "../../utils/fetcher";
// import ProductCard from "../../components/ProductCard";

// export default function HomePage() {
//   // ---------------------------
//   // State variables
//   // ---------------------------
//   const [q, setQ] = useState(""); // Search input value
//   const [loading, setLoading] = useState(false); // Loading spinner state
//   const [results, setResults] = useState([]); // Array of search results
//   const [error, setError] = useState(""); // Error messages
//   const [allProducts, setAllProducts] = useState([]); // All products list
//   const [recentDrops, setRecentDrops] = useState([]); // Recently dropped products
  
  

//   // ---------------------------
//   // Initial load: fetch all products + recent drops
//   // ---------------------------
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true);

//         const data = await apiFetch(API.products()); // 👈 assume API.products() = /api/products/
//         console.log("Products from API:", data);

//         if (Array.isArray(data)) {
//           setAllProducts(data);
//         }
        
//         // Filter recently dropped
//         const dropped = await apiFetch("/api/products/recently-dropped/");
//         console.log("Detected dropped products:", dropped);
        

//         if (Array.isArray(dropped)) {
//           setRecentDrops(dropped);
//         }

//       } catch (err) {
//         setError(err.message || "Failed to load products");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProducts();
//   }, []);

  

//   // ---------------------------
//   // Search handler
//   // ---------------------------
//   const onSearch = useCallback(
//     async (e) => {
//       e?.preventDefault?.(); // Prevent form submit reload
//       if (!q.trim()) return;

//       setLoading(true);
//       setError("");
//       try {
//         console.log("query ===> ", q);

//         // Fetch from backend API
//         const data = await apiFetch(API.search(q));
//         console.log("result ==> ", data);

//         // Normalize result to array for consistent rendering
//         if (Array.isArray(data)) {
//           setResults([...data].reverse());
//         } else if (data.search_results) {
//           setResults(data.search_results);
//         } else if (data) {
//           setResults([data]);
//         } else {
//           setResults([]);
//         }
//       } catch (err) {
//         setError(err.message || "Search failed");
//       } finally {
//         setLoading(false);
//       }
//     },
//     [q]
//   );

  

//   // ---------------------------
//   // Render UI
//   // ---------------------------
  
//   return (
//     <div className="mx-auto max-w-6xl px-4 py-8">
//       {/* Page Header */}
//       <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
//         <h1 className="text-2xl font-bold">Find the best price</h1>
//       </header>

//       {/* Search form */}
//       <form
//         onSubmit={onSearch}
//         className="flex w-full items-center gap-2 rounded-2xl border p-2 shadow-sm"
//       >
//         <input
//           type="text"
//           placeholder="Search products (paste a URL or enter a name)"
//           className="w-full rounded-xl px-3 py-2 outline-none"
//           value={q}
//           onChange={(e) => setQ(e.target.value)}
//         />
//         <button
//           type="submit"
//           className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
//           disabled={loading}
//         >
//           {loading ? "Searching…" : "Search"}
//         </button>
//       </form>

//       {/* Display error message */}
//       {error && (
//         <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
//           {error}
//         </div>
//       )}

//       {/* Search results grid */}
//       {/* <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//         {results.map((p, idx) => (
//           <ProductCard key={p.id || idx} product={p} />
//         ))}
//       </section> */}

//       {results.length > 0 && (
//         <section className="mt-6">
//           <h2 className="text-xl font-bold mb-3">Search Results</h2>
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//             {results.map((p, idx) => (
//               <ProductCard key={p.id || idx} product={p} />
//             ))}
//           </div>
//         </section>
//       )}

//       {/* If no search → show product list */}
//       {results.length === 0 && (
//         <>
//           {/* Recently Dropped */}
//           <section className="mt-10">
//             <h2 className="text-xl font-bold mb-3">Recently Price Dropped</h2>
//             {recentDrops.length > 0 ? (
//               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                 {recentDrops.map((p, idx) => (
//                   <ProductCard key={p.id || idx} product={p} />
//                 ))}
//               </div>
//             ) : (
//               <p className="text-sm text-gray-500">No recent price drops.</p>
//             )}
//           </section>
//           {/* All Products */}
//           <section className="mt-10">
//             <h2 className="text-xl font-bold mb-3">All Products</h2>
//             {allProducts.length > 0 ? (
//               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//                 {allProducts.map((p, idx) => (
//                   <ProductCard key={p.id || idx} product={p} />
//                 ))}
//               </div>
//             ) : (
//               <p className="text-sm text-gray-500">No products found.</p>
//             )}
//           </section>
//         </>
//       )}

//       {/* Fallback message when no results */}
//       {!loading && results.length === 0 && allProducts.length === 0 &&  (
//         <div className="mt-10 text-sm text-gray-500">
//           Try searching for “iPhone 15 Pro” or paste a product URL.
//         </div>
//       )}
//     </div>
//   );
// }

// ------------------------------
// DeepSeek code
// --------------------------------

import { useCallback, useState, useEffect } from "react";
import { API } from "../../utils/api";
import { apiFetch } from "../../utils/fetcher";
import ProductCard from "../../components/ProductCard";

export default function HomePage() {
  // ---------------------------
  // State variables
  // ---------------------------
  const [q, setQ] = useState(""); // Search input value
  const [loading, setLoading] = useState(false); // Loading spinner state
  const [searchLoading, setSearchLoading] = useState(false); // Separate loading for search
  const [results, setResults] = useState([]); // Array of search results
  const [error, setError] = useState(""); // Error messages
  const [allProducts, setAllProducts] = useState([]); // All products list
  const [recentDrops, setRecentDrops] = useState([]); // Recently dropped products
  const [initialLoading, setInitialLoading] = useState(true); // Initial data loading

  // ---------------------------
  // Initial load: fetch all products + recent drops
  // ---------------------------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setInitialLoading(true);
        setError("");

        // Fetch all products
        const productsData = await apiFetch(API.products());
        console.log("Products from API:", productsData);

        if (Array.isArray(productsData)) {
          setAllProducts(productsData);
        } else if (productsData.results && Array.isArray(productsData.results)) {
          setAllProducts(productsData.results);
        } else {
          setAllProducts([]);
        }
        
        // Fetch recently dropped products
        try {
          const droppedData = await apiFetch(API.recentlyDropped());
          console.log("Detected dropped products:", droppedData);
          
          if (Array.isArray(droppedData)) {
            setRecentDrops(droppedData);
          } else if (droppedData.results && Array.isArray(droppedData.results)) {
            setRecentDrops(droppedData.results);
          } else {
            setRecentDrops([]);
          }
        } catch (dropErr) {
          console.warn("Could not fetch recent drops:", dropErr);
          setRecentDrops([]);
        }

      } catch (err) {
        console.error("Failed to load products:", err);
        setError(err.message || "Failed to load products");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ---------------------------
  // Search handler
  // ---------------------------
  const onSearch = useCallback(
    async (e) => {
      e?.preventDefault?.(); // Prevent form submit reload
      const searchQuery = q.trim();
      if (!searchQuery) {
        setResults([]);
        return;
      }

      setSearchLoading(true);
      setError("");
      try {
        console.log("Search query:", searchQuery);

        // Fetch from backend API
        const data = await apiFetch(API.search(searchQuery));
        console.log("Search results:", data);

        // Normalize result to array for consistent rendering
        let searchResults = [];
        
        if (Array.isArray(data)) {
          searchResults = data;
        } else if (data.search_results && Array.isArray(data.search_results)) {
          searchResults = data.search_results;
        } else if (data.results && Array.isArray(data.results)) {
          searchResults = data.results;
        } else if (data) {
          searchResults = [data];
        }

        // Reverse to show newest first, but limit to reasonable number
        setResults(searchResults.slice(0, 50));

      } catch (err) {
        console.error("Search error:", err);
        setError(err.message || "Search failed. Please try again.");
        setResults([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [q]
  );

  // Handle Enter key press for search
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch(e);
    }
  };

  // Clear search and results
  const clearSearch = () => {
    setQ("");
    setResults([]);
    setError("");
  };

  // ---------------------------
  // Render UI
  // ---------------------------
  
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Page Header */}
      <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Find the Best Price</h1>
          <p className="mt-2 text-gray-600">Track prices across Amazon, Flipkart and more</p>
        </div>
        {allProducts.length > 0 && (
          <div className="text-sm text-gray-500">
            {allProducts.length} products tracked
          </div>
        )}
      </header>

      {/* Search form */}
      <div className="mb-8">
        <form
          onSubmit={onSearch}
          className="flex w-full items-center gap-2 rounded-2xl border border-gray-300 bg-white p-2 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
        >
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search products (paste a URL or enter a name)"
              className="w-full rounded-xl px-4 py-3 outline-none placeholder-gray-400"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={searchLoading}
            />
          </div>
          <div className="flex gap-2">
            {q && (
              <button
                type="button"
                onClick={clearSearch}
                className="rounded-xl bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-300 transition-colors"
                disabled={searchLoading}
              >
                Clear
              </button>
            )}
            <button
              type="submit"
              className="rounded-xl bg-gray-900 px-6 py-2 text-sm font-semibold text-white hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={searchLoading || !q.trim()}
            >
              {searchLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Searching...
                </div>
              ) : (
                "Search"
              )}
            </button>
          </div>
        </form>
        
        {/* Search tips */}
        <div className="mt-2 text-xs text-gray-500">
          💡 Try: "iPhone 15", "Samsung Galaxy", or paste Amazon/Flipkart product URL
        </div>
      </div>

      {/* Display error message */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Loading state for initial data */}
      {initialLoading && (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-900 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        </div>
      )}

      {/* Search results */}
      {!initialLoading && results.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Search Results ({results.length})
            </h2>
            <button
              onClick={clearSearch}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear results
            </button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p, idx) => (
              <ProductCard key={p.id || p.url || idx} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* If no search → show product list */}
      {!initialLoading && results.length === 0 && (
        <>
          {/* Recently Dropped */}
          {recentDrops.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                🔥 Recently Price Dropped
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {recentDrops.map((p, idx) => (
                  <ProductCard key={p.id || idx} product={p} />
                ))}
              </div>
            </section>
          )}

          {/* All Products */}
          {allProducts.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  All Tracked Products ({allProducts.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {allProducts.map((p, idx) => (
                  <ProductCard key={p.id || idx} product={p} />
                ))}
              </div>
            </section>
          )}

          {/* Empty state when no products at all */}
          {!initialLoading && allProducts.length === 0 && recentDrops.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-500 mb-4">Start by searching for products to track</p>
              <div className="text-sm text-gray-400">
                Try searching for "iPhone 15 Pro" or paste a product URL from Amazon/Flipkart
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
