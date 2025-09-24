import { useState } from "react";

export default function ProductSearch() {
  // ---------------------------
  // State variables
  // ---------------------------
  const [query, setQuery] = useState("");         // Search input value
  const [results, setResults] = useState(null);   // Search results array
  const [loading, setLoading] = useState(false);  // Loading state
  const [error, setError] = useState("");         // Error message

  // ---------------------------
  // Handle Search
  // ---------------------------
  const handleSearch = async () => {
    if (!query) return; // Prevent empty search

    setLoading(true);
    setError("");
    setResults(null);

    try {
      // Fetch from backend API
      const res = await fetch(
        `http://localhost:8000/api/products/?search=${encodeURIComponent(query)}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch product");
      }

      const data = await res.json();
      console.log("API response:", data);

      // Determine result type
      if (data.id) {
        // Single product (URL search)
        setResults([data]);
      } else if (data.search_results) {
        // Multiple products (keyword search)
        setResults(data.search_results);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="p-4">
      {/* Search input */}
      <input
        type="text"
        value={query}
        placeholder="Enter product URL or keyword"
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 rounded w-full"
      />

      {/* Search button */}
      <button
        onClick={handleSearch}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
      >
        Search
      </button>

      {/* Loading & Error states */}
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Search results */}
      {results && results.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((prod, index) => (
            <div key={index} className="border p-2 rounded shadow">
              {/* Product image */}
              <img
                src={prod.image}
                alt={prod.name}
                className="w-full h-48 object-contain"
              />
              {/* Product name */}
              <h3 className="font-semibold mt-2">{prod.name}</h3>
              {/* Product price */}
              <p className="text-green-700 font-bold">₹{prod.price}</p>
              {/* Product link */}
              {prod.url && (
                <a
                  href={prod.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  View Product
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No results found */}
      {results && results.length === 0 && <p>No products found.</p>}
    </div>
  );
}
