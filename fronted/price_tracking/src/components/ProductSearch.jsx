// import { useState } from "react";

// export default function ProductSearch() {
//   // ---------------------------
//   // State variables
//   // ---------------------------
//   const [query, setQuery] = useState("");         // Search input value
//   const [results, setResults] = useState(null);   // Search results array
//   const [loading, setLoading] = useState(false);  // Loading state
//   const [error, setError] = useState("");         // Error message

//   // ---------------------------
//   // Handle Search
//   // ---------------------------
//   const handleSearch = async () => {
//     if (!query) return; // Prevent empty search

//     setLoading(true);
//     setError("");
//     setResults(null);

//     try {
//       // Fetch from backend API
//       const res = await fetch(
//         `http://localhost:8000/api/products/?search=${encodeURIComponent(query)}`
//       );

//       if (!res.ok) {
//         throw new Error("Failed to fetch product");
//       }

//       const data = await res.json();
//       console.log("API response:", data);

//       // Determine result type
//       if (data.id) {
//         // Single product (URL search)
//         setResults([data]);
//       } else if (data.search_results) {
//         // Multiple products (keyword search)
//         setResults(data.search_results);
//       } else {
//         setResults([]);
//       }
//     } catch (err) {
//       console.error(err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ---------------------------
//   // Render
//   // ---------------------------
//   return (
//     <div className="p-4">
//       {/* Search input */}
//       <input
//         type="text"
//         value={query}
//         placeholder="Enter product URL or keyword"
//         onChange={(e) => setQuery(e.target.value)}
//         className="border p-2 rounded w-full"
//       />

//       {/* Search button */}
//       <button
//         onClick={handleSearch}
//         className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
//       >
//         Search
//       </button>

//       {/* Loading & Error states */}
//       {loading && <p>Loading...</p>}
//       {error && <p className="text-red-500">{error}</p>}

//       {/* Search results */}
//       {results && results.length > 0 && (
//         <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//           {results.map((prod, index) => (
//             <div key={index} className="border p-2 rounded shadow">
//               {/* Product image */}
//               <img
//                 src={prod.image}
//                 alt={prod.name}
//                 className="w-full h-48 object-contain"
//               />
//               {/* Product name */}
//               <h3 className="font-semibold mt-2">{prod.name}</h3>
//               {/* Product price */}
//               <p className="text-green-700 font-bold">₹{prod.price}</p>
//               {/* Product link */}
//               {prod.url && (
//                 <a
//                   href={prod.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="text-blue-500 underline"
//                 >
//                   View Product
//                 </a>
//               )}
//             </div>
//           ))}
//         </div>
//       )}

//       {/* No results found */}
//       {results && results.length === 0 && <p>No products found.</p>}
//     </div>
//   );
// }


// -------------------------------
// Theme 02
// -------------------------------


import { useState } from "react";
import { API } from "../utils/api";
import { apiFetch } from "../utils/fetcher";
import ProductCard from "./ProductCard";

export default function ProductSearch() {
  // ---------------------------
  // State variables
  // ---------------------------
  const [query, setQuery] = useState("");         // Search input value
  const [results, setResults] = useState([]);     // Search results array
  const [loading, setLoading] = useState(false);  // Loading state
  const [error, setError] = useState("");         // Error message
  const [searchType, setSearchType] = useState("keyword"); // "keyword" or "url"

  // ---------------------------
  // Handle Search
  // ---------------------------
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    
    const searchQuery = query.trim();
    if (!searchQuery) {
      setError("Please enter a search query");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      console.log("Searching for:", searchQuery);
      
      // Fetch from backend API using your existing API utility
      const data = await apiFetch(API.search(searchQuery));
      console.log("API response:", data);

      // Normalize the response data
      let searchResults = [];

      if (Array.isArray(data)) {
        // Direct array response
        searchResults = data;
      } else if (data.search_results && Array.isArray(data.search_results)) {
        // Nested search_results array
        searchResults = data.search_results;
      } else if (data.results && Array.isArray(data.results)) {
        // Nested results array (pagination)
        searchResults = data.results;
      } else if (data.id) {
        // Single product object
        searchResults = [data];
      } else if (typeof data === 'object' && data !== null) {
        // Single product in object format
        searchResults = [data];
      }

      // Filter out invalid results and limit to reasonable number
      const validResults = searchResults
        .filter(item => item && (item.title || item.name))
        .slice(0, 50); // Limit results for performance

      setResults(validResults);

      if (validResults.length === 0) {
        setError("No products found. Try different keywords or paste a product URL.");
      }

    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Failed to search products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Clear Search
  // ---------------------------
  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setError("");
  };

  // ---------------------------
  // Handle Enter Key
  // ---------------------------
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  // ---------------------------
  // Detect search type based on input
  // ---------------------------
  const detectSearchType = (input) => {
    // Simple URL detection
    const isUrl = input.includes('http://') || input.includes('https://') || 
                  input.includes('amazon.') || input.includes('flipkart.');
    setSearchType(isUrl ? 'url' : 'keyword');
  };

  const handleQueryChange = (value) => {
    setQuery(value);
    detectSearchType(value);
    if (error) setError(""); // Clear error when user starts typing
  };

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Search Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Find Products to Track
        </h1>
        <p className="text-gray-600">
          Search by product name or paste a URL from Amazon, Flipkart, etc.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="flex-1">
              <input
                type="text"
                value={query}
                placeholder="Search 'iPhone 15' or paste product URL..."
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              
              {/* Search Type Indicator */}
              {query && (
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full ${
                    searchType === 'url' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {searchType === 'url' ? '🔗 URL Search' : '🔍 Keyword Search'}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {query && (
                <button
                  type="button"
                  onClick={clearSearch}
                  disabled={loading}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
                >
                  Clear
                </button>
              )}
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Searching...
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search Tips */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>💡 <strong>Try:</strong> "Samsung Galaxy", "MacBook Air", or paste Amazon/Flipkart URLs</p>
            <p>✨ Search by keywords for multiple results or URLs for specific products</p>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Search Results ({results.length})
            </h2>
            <button
              onClick={clearSearch}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear results
            </button>
          </div>
          
          {/* Results Grid using your existing ProductCard component */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((product, index) => (
              <ProductCard 
                key={product.id || product.url || index} 
                product={product} 
              />
            ))}
          </div>
        </div>
      )}

      {/* No Results Message */}
      {!loading && results.length === 0 && query && !error && (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-2xl p-8">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              Try different keywords or check if the product URL is correct.
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>• Make sure your spelling is correct</p>
              <p>• Try more general search terms</p>
              <p>• Ensure product URLs are from supported stores</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-3 text-gray-600">Searching products...</p>
        </div>
      )}
    </div>
  );
}