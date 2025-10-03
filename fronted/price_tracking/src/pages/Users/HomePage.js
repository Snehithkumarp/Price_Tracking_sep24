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
  const [results, setResults] = useState([]); // Array of search results
  const [error, setError] = useState(""); // Error messages
  const [allProducts, setAllProducts] = useState([]); // All products list
  const [recentDrops, setRecentDrops] = useState([]); // Recently dropped products
  
  

  // ---------------------------
  // Initial load: fetch all products + recent drops
  // ---------------------------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const data = await apiFetch(API.products()); // 👈 assume API.products() = /api/products/
        console.log("Products from API:", data);

        if (Array.isArray(data)) {
          setAllProducts(data);
        }
        
        // Filter recently dropped
        const dropped = await apiFetch("/api/products/recently-dropped/");
        console.log("Detected dropped products:", dropped);
        

        if (Array.isArray(dropped)) {
          setRecentDrops(dropped);
        }

      } catch (err) {
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
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
      if (!q.trim()) return;

      setLoading(true);
      setError("");
      try {
        console.log("query ===> ", q);

        // Fetch from backend API
        const data = await apiFetch(API.search(q));
        console.log("result ==> ", data);

        // Normalize result to array for consistent rendering
        if (Array.isArray(data)) {
          setResults([...data].reverse());
        } else if (data.search_results) {
          setResults(data.search_results);
        } else if (data) {
          setResults([data]);
        } else {
          setResults([]);
        }
      } catch (err) {
        setError(err.message || "Search failed");
      } finally {
        setLoading(false);
      }
    },
    [q]
  );

  

  // ---------------------------
  // Render UI
  // ---------------------------
  
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Page Header */}
      <header className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold">Find the best price</h1>
      </header>

      {/* Search form */}
      <form
        onSubmit={onSearch}
        className="flex w-full items-center gap-2 rounded-2xl border p-2 shadow-sm"
      >
        <input
          type="text"
          placeholder="Search products (paste a URL or enter a name)"
          className="w-full rounded-xl px-3 py-2 outline-none"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          disabled={loading}
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>

      {/* Display error message */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Search results grid */}
      {/* <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((p, idx) => (
          <ProductCard key={p.id || idx} product={p} />
        ))}
      </section> */}

      {results.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xl font-bold mb-3">Search Results</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p, idx) => (
              <ProductCard key={p.id || idx} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* If no search → show product list */}
      {results.length === 0 && (
        <>
          {/* Recently Dropped */}
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-3">Recently Price Dropped</h2>
            {recentDrops.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recentDrops.map((p, idx) => (
                  <ProductCard key={p.id || idx} product={p} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No recent price drops.</p>
            )}
          </section>
          {/* All Products */}
          <section className="mt-10">
            <h2 className="text-xl font-bold mb-3">All Products</h2>
            {allProducts.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {allProducts.map((p, idx) => (
                  <ProductCard key={p.id || idx} product={p} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No products found.</p>
            )}
          </section>
        </>
      )}

      {/* Fallback message when no results */}
      {!loading && results.length === 0 && allProducts.length === 0 &&  (
        <div className="mt-10 text-sm text-gray-500">
          Try searching for “iPhone 15 Pro” or paste a product URL.
        </div>
      )}
    </div>
  );
}
