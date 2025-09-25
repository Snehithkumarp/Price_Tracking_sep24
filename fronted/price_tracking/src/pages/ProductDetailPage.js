// ==============================
// 📦 Product Detail Page
// ==============================
// Shows a single product's details, price, price history chart, and allows setting price alerts

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { API, API_BASE } from "../utils/api";
import { apiFetch } from "../utils/fetcher";

export default function ProductDetailPage() {
  // 🏷 Get product ID from URL params
  const { id } = useParams();

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
  const [repeat, setRepeat] = useState(false); // 🔹 new for repeat alerts

  const token = localStorage.getItem("token");

  // ==============================
  // 🔹 Fetch product details, price history, and user alerts
  // ==============================
  // useEffect(() => {
  //   let mounted = true; // prevent state update if component unmounts

  //   const fetchData = async () => {
  //     setLoading(true);
  //     setError("");

  //     try {
  //       // Fetch product info + price history in parallel
  //       const [p, h] = await Promise.all([
  //         apiFetch(API.product(id)),
  //         apiFetch(API.priceHistory(id)),
  //       ]);
  //       if (!mounted) return;

  //       setProduct(p);

  //       // Normalize history to array and format dates
  //       const rawHistory = Array.isArray(h?.results) ? h.results : h;
  //       setHistory(
  //         rawHistory.map((item) => ({
  //           ...item,
  //           date: new Date(item.date).toLocaleDateString(),
  //         }))
  //       );

  //       // If logged in, fetch user's alerts for this product
  //       if (token) {
  //         const userAlerts = await apiFetch(API.alerts.list(), token, "GET");
  //         setAlerts(userAlerts.filter((a) => a.product === p.id));
  //       }
  //     } catch (err) {
  //       if (!mounted) return;
  //       const msg =
  //         err.response?.data?.detail || err.message || "Failed to load product";
  //       setError(msg);
  //     } finally {
  //       if (mounted) setLoading(false);
  //     }
  //   };

  //   fetchData();
  //   return () => {
  //     mounted = false; // cleanup
  //   };
  // }, [id, token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("Fetching product:", API.product(id));
        const p = await apiFetch(API.product(id));
        console.log("Product data:", p);
        console.log("Product history:", p.history);

        setHistory(
          p.history?.map((item) => ({
            ...item,
            date: new Date(item.date).toLocaleDateString(),
          }))
        );
        setLoading(false);
        setProduct(p);
      } catch (err) {
        console.error("Fetch product failed:", err);
        setError(err.message);
      }
    };
    fetchData();
  }, [id]);

  // ==============================
  // 🔹 Handle setting a price alert
  // ==============================
  const handleSetAlert1 = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage("❌ You must be logged in to set alerts.");
      return;
    }

    console.log(
      "Hiiiiiiiiiiiiii========> ",
      product.id,
      Number(alertPrice),
      token
    );

    try {
      // await apiFetch(API.alerts.create(), token, "POST", {
      //   product: product.id,
      //   threshold: Number(alertPrice),
      //   active: true,
      // });

      await apiFetch(
        API.alerts.create(),
        "POST",
        {
          product: product.id,
          threshold: Number(alertPrice),
          active: true,
        },
        token
      );

      await apiFetch(
        `${API_BASE}/api/tracked/${product.id}/set_alert/`,
        "POST",
        { threshold: Number(alertPrice) },
        token
      );

      setMessage("✅ Price alert set successfully!");
      setAlertPrice("");

      // Refresh alerts after setting
      // const userAlerts = await apiFetch(API.alerts.list(), token, "GET");
      const userAlerts = await apiFetch(API.alerts.list(), "GET", null, token);
      console.log("User Alerts  ==> ", userAlerts);

      setAlerts(userAlerts.filter((a) => a.product === product.id));
    } catch (err) {
      const { Error } = err;
      console.log("err alerts ==> ", err);

      const msg =
        err?.Error?.detail ||
        err.response?.data?.detail ||
        err.message ||
        "❌ Failed to set alert.";
      console.log("msg ==> ", msg);

      setMessage(msg);
    } finally {
      // Clear message after 4s
      setTimeout(() => setMessage(""), 10000);
    }
  };

  const handleSetAlert = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage("❌ You must be logged in to set alerts.");
      return;
    }

    try {
      // -----------------------------
      // Step 1: Create or update tracked product with threshold + repeat option
      // -----------------------------
      console.log("req 1");

      const req1 = await apiFetch(
        `${API_BASE}/api/tracked/`,
        "POST", // let backend handle create_or_update
        {
          product_id: product.id,
          threshold: Number(alertPrice),
          active: true,
          repeat_alerts: repeat, // 👈 checkbox value
        },
        token
      );
      console.log("Tracked product response:", req1);

      const trackedId = req1.id; // 👈 use the tracked product ID

      // -----------------------------
      // Step 2: Set alert on tracked product
      // -----------------------------
      const req2 = await apiFetch(
        `${API_BASE}/api/tracked/${trackedId}/set-alert/`,
        "POST",
        { threshold: Number(alertPrice) },
        token
      );

      console.log("req2 ==> ", req2);

      setMessage("✅ Price alert set successfully!");
      setAlertPrice("");

      // -----------------------------
      // Step 3: Refresh tracked products for user
      // -----------------------------
      const userTracked = await apiFetch(
        `${API_BASE}/api/tracked/`,
        "GET",
        null,
        token
      );
      console.log("User tracked products ==> ", userTracked);
      // setTracked(userTracked);
    } catch (err) {
      console.log("Error setting alert ==> ", err);
      const msg =
        err?.Error?.detail ||
        err.response?.data?.detail ||
        err.message ||
        "❌ Failed to set alert.";
      setMessage(msg);
    } finally {
      setTimeout(() => setMessage(""), 10000);
    }
  };

  const currency = product?.currency || "₹";

  // ==============================
  // 🔹 Loading/Error States
  // ==============================
  if (loading)
    return <div className="text-sm text-gray-500">Loading product…</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  // ==============================
  // 🔹 Render Product Details
  // ==============================
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Product Image */}
        <div className="rounded-2xl border bg-white p-3 shadow-sm">
          <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                No image
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold leading-tight">{product.title}</h1>
          <div className="text-3xl font-black">
            {currency}
            {product.current_price}
          </div>
          {product.last_checked && (
            <div className="text-xs text-gray-500">
              Last checked: {new Date(product.last_checked).toLocaleString()}
            </div>
          )}

          {product.product_url && (
            <div className="rounded-2xl border bg-white p-4 shadow-sm">
              <a
                href={product.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:from-indigo-700 hover:to-purple-700"
              >
                🛒 View Product on Store
              </a>
              <p className="mt-2 text-center text-xs text-gray-500">
                Redirects to the original seller site
              </p>
            </div>
          )}

          {/* Price Alert Form */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-gray-700">
              Set Price Alert
            </h2>
            <form onSubmit={handleSetAlert} className="flex gap-2">
              <input
                type="number"
                placeholder="Enter target price"
                value={alertPrice}
                onChange={(e) => setAlertPrice(e.target.value)}
                required
                className="flex-1 rounded border px-3 py-2 text-sm"
              />

              {/* 🔹 Repeat Alerts Checkbox */}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={repeat}
                  onChange={(e) => setRepeat(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                Send multiple alerts (repeat)
              </label>

              <button
                type="submit"
                className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Set
              </button>
            </form>
            {message && <p className="mt-2 text-sm">{message}</p>}
            {alerts.length > 0 && (
              <ul className="mt-3 space-y-1 text-sm text-gray-600">
                {alerts.map((a) => (
                  <li key={a.id}>
                    Alert at {currency}
                    {a.threshold} → {a.active ? "🟢 Active" : "🔴 Triggered"}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Price History Chart */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-gray-700">
              Price history
            </h2>
            {history.length > 0 ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={history}
                    margin={{ top: 8, right: 12, bottom: 8, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={["auto", "auto"]} />
                    <Tooltip formatter={(v) => `${currency}${v}`} />
                    <Line
                      type="monotone"
                      dataKey="price"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No history yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
