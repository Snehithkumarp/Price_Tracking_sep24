// ==============================
// 📌 My Tracked Products Page
// ==============================
// This page shows all products the logged-in user is tracking.
// Users can remove tracked products or set price alerts.

import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"; // custom auth hook
import { apiFetch } from "../utils/fetcher"; // wrapper for API calls
import { API_BASE } from "../utils/api"; // base URL of backend API

export default function MyTrackedProductsPage() {
  const auth = useAuth(); // get current user's token & info

  // ==============================
  // 🔹 Local state
  // ==============================
  const [tracked, setTracked] = useState([]); // stores list of tracked products
  const [loading, setLoading] = useState(true); // loading indicator
  const [error, setError] = useState(""); // error messages

  // ==============================
  // 🔹 Fetch tracked products from backend
  // ==============================
  const fetchTracked = async () => {
    setLoading(true); // show loader
    setError(""); // reset error

    try {
      // Make GET request to backend API to fetch user's tracked products
      const data = await apiFetch(
        `${API_BASE}/api/tracked/`,
        "GET",
        null,
        auth.token // include auth token in request
      );

      setTracked(data); // update state with fetched products
    } catch (err) {
      // handle errors
      console.error("Error fetching tracked products:", err);
      setError(err.message || "Failed to load tracked products");
    } finally {
      setLoading(false); // hide loader
    }
  };

  // Fetch tracked products when component mounts, only if user is logged in
  useEffect(() => {
    if (auth.token) fetchTracked();
  }, [auth.token]);

  // ==============================
  // 🔹 Remove a product from tracked list
  // ==============================
  const handleRemove = async (id) => {
    // Ask for confirmation before removing
    if (!window.confirm("Remove this product from tracked list?")) return;

    try {
      // Send DELETE request to backend
      await apiFetch(
        `${API_BASE}/api/tracked/${id}/`,
        "DELETE",
        null,
        auth.token
      );

      // Refresh tracked products from backend to stay in sync
      await fetchTracked();
    } catch (err) {
      console.error("Error removing tracked product:", err);
      alert("❌ Failed to remove product.");
    }
  };

  // ==============================
  // 🔹 Set a price alert (unified function)
  // ==============================
  const handleSetAlert = async (productOrTracked) => {
    if (!auth.token) {
      alert("❌ You must be logged in");
      return;
    }

    // Ask user for threshold price
    const raw = prompt("Enter price threshold (numbers only):");
    if (!raw) return;

    const threshold = parseInt(raw);
    if (isNaN(threshold)) {
      alert("Invalid number");
      return;
    }

    try {
      let trackedId;

      // -----------------------------
      // Determine if the product is already tracked
      // -----------------------------
      if (productOrTracked.id && productOrTracked.product) {
        // Already tracked product from MyTrackedProductsPage
        trackedId = productOrTracked.id;
      } else {
        // ProductDetail page: need to create tracked product first
        const trackedResp = await apiFetch(
          `${API_BASE}/api/tracked/`,
          "POST",
          { product_id: productOrTracked.id },
          auth.token
        );
        trackedId = trackedResp.id;
      }

      // -----------------------------
      // Send request to set alert
      // -----------------------------
      const alertResp = await apiFetch(
        `${API_BASE}/api/tracked/${trackedId}/set-alert/`,
        "POST",
        { threshold },
        auth.token
      );

      console.log("✅ Alert set response:", alertResp);
      alert(`✅ ${alertResp.message || "Alert set successfully!"}`);

      // Refresh tracked list if we're on the tracked products page
      if (tracked) await fetchTracked();
    } catch (err) {
      console.error("❌ Error setting alert:", err);
      if (err.response) {
        const text = await err.response.text();
        console.error("Backend error body:", text);
      }
      alert("❌ Failed to set alert.");
    }
  };

  // ==============================
  // 🔹 Not logged-in view
  // ==============================
  if (!auth.token) {
    return <div className="p-6">Please log in to view your tracked products.</div>;
  }

  // ==============================
  // 🔹 Render tracked products list
  // ==============================
  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold mb-4">My Tracked Products</h1>

      {/* Show loading state */}
      {loading && <div>Loading…</div>}

      {/* Show error message if any */}
      {error && <div className="text-red-600">{error}</div>}

      {/* List of tracked products */}
      <ul className="space-y-4">
        {tracked.length > 0 &&
          tracked.map((t) => (
            <li key={t.id} className="flex items-center gap-4 border rounded p-3">
              {/* Product image */}
              <img
                src={t.product?.image_url}
                alt={t.product?.title}
                className="w-20 h-20 object-cover rounded"
              />

              {/* Product info */}
              <div className="flex-1">
                <div className="font-semibold">{t?.nickname || t?.product?.title}</div>
                <div className="text-sm text-gray-600">
                  Current: {t.product?.currency}{t.product?.current_price}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleSetAlert(t)}
                  className="rounded px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Set Alert
                </button>
                <button
                  onClick={() => handleRemove(t.id)}
                  className="rounded px-3 py-2 bg-red-500 text-white hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
      </ul>

      {/* Empty state if no tracked products */}
      {!loading && tracked.length === 0 && (
        <div className="mt-6 text-sm text-gray-500">
          You are not tracking any products yet.
        </div>
      )}
    </div>
  );
}
