// ==============================
// 📌 Signup Page
// ==============================
// Allows users to create an account and redirects them to login after success

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../../utils/fetcher";
import { API } from "../../utils/api";

export default function SignupPage() {
  const nav = useNavigate(); // react-router navigation
  const [username, setUsername] = useState(""); // backend expects username
  const [email, setEmail] = useState(""); // email input
  const [password, setPassword] = useState(""); // password input
  const [loading, setLoading] = useState(false); // loading state during API call
  const [error, setError] = useState(""); // error message

  // ==============================
  // 🔹 Handle signup form submission
  // ==============================
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const data = { username, email, password }; // prepare payload
    //   try {
    //     // Call backend signup API
    //     await apiFetch(API.signup(), "POST", data);
    //     alert("✅ Signup successful! Please log in.");
    //     nav("/login"); // redirect to login page
    //   } catch (err) {
    //     console.error("Signup failed:", err);
    //     setError(err.response?.data?.detail || "Signup failed"); // show error from backend
    //   } finally {
    //     setLoading(false); // stop loading
    //   }
    // };
    // inside SignupPage, update catch block:
    try {
      await apiFetch(API.signup(), "POST", data);
      alert("✅ Signup successful! Please log in.");
      nav("/login");
    } catch (err) {
      console.error("Signup failed:", err);

      let backendMsg = "Signup failed";

      if (err?.data) {
        if (typeof err.data === "object" && !Array.isArray(err.data)) {
          backendMsg = Object.entries(err.data)
            .map(([field, messages]) => {
              if (Array.isArray(messages)) {
                return `${field}: ${messages.join(", ")}`;
              }
              return `${field}: ${messages}`;
            })
            .join("\n \n"); // 👈 puts each error on a new line
        } else if (err.data.detail) {
          backendMsg = err.data.detail;
        } else {
          backendMsg = JSON.stringify(err.data);
        }
      } else if (err.message) {
        backendMsg = err.message;
      }

      setError(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Signup</h1>
        </div>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Signup...</p>
        </div>
      </div>
    );
  }

  // ==============================
  // 🔹 Render Signup Form
  // ==============================
  return (
    <div className="mx-auto grid max-w-md gap-4 px-4 py-12">
      <h1 className="text-2xl font-bold">Create your account</h1>

      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Signup form */}
      <form
        onSubmit={handleSignup}
        className="rounded-2xl border bg-white p-4 shadow-sm"
      >
        <label className="block text-sm font-medium">Username</label>
        <input
          type="text"
          className="mt-1 w-full rounded-xl border px-3 py-2"
          placeholder="arya"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label className="mt-4 block text-sm font-medium">Email</label>
        <input
          type="email"
          className="mt-1 w-full rounded-xl border px-3 py-2"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="mt-4 block text-sm font-medium">Password</label>
        <input
          type="password"
          className="mt-1 w-full rounded-xl border px-3 py-2"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      {/* Link to login */}
      <p className="text-sm text-gray-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
