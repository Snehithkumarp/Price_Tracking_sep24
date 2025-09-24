import { useCallback, useState } from "react";
import { API } from "../utils/api";
import { apiFetch } from "../utils/fetcher";
import ProductCard from "../components/ProductCard";

export default function HomePage() {
  // ---------------------------
  // State variables
  // ---------------------------
  const [q, setQ] = useState("");        // Search input value
  const [loading, setLoading] = useState(false); // Loading spinner state
  const [results, setResults] = useState([]);    // Array of search results
  const [error, setError] = useState("");        // Error messages

  // ---------------------------
  // Search handler
  // ---------------------------
  const onSearch = useCallback(async (e) => {
    e?.preventDefault?.(); // Prevent form submit reload
    // if (!q.trim()) return;
    
    setLoading(true);
    setError("");
    try {
      console.log("query ===> ", q);

      // Fetch from backend API
      const data = await apiFetch(API.search(q));
      console.log("result ==> ", data);

      // Normalize result to array for consistent rendering
      if (Array.isArray(data)) {
        const rev=data.reverse()
        setResults(rev);  // Already array
      } else if (data.search_results) {
        setResults(data.search_results); // Keyword search
      } else {
        setResults([data]); // Single product object
      }
    } catch (err) {
      setError(err.message || "Search failed");
    } finally {
      setLoading(false);
    }
  }, [q]);

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
      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((p, idx) => (
          <ProductCard key={p.id || idx} product={p} />
        ))}
      </section>

      {/* Fallback message when no results */}
      {!loading && results.length === 0 && (
        <div className="mt-10 text-sm text-gray-500">
          Try searching for “iPhone 15 Pro” or paste a product URL.
        </div>
      )}
    </div>
  );
}
