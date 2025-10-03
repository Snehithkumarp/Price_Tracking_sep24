// ==============================
// 🔑 Login Page
// ==============================
// Allows user to log in, stores JWT token, and redirects to home page

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API } from "../../utils/api";
import { apiFetch } from "../../utils/fetcher";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const nav = useNavigate(); // used for programmatic navigation after login
 const { login } = useAuth();
  // ==============================
  // 🔹 Local state
  // ==============================
  const [username, setUsername] = useState(""); // backend expects 'username' field
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // tracks API request
  const [error, setError] = useState(""); // shows error messages

  // ==============================
  // 🔹 Login handler
  // ==============================
  const handleLogin1 = async (e) => {
    e.preventDefault(); // prevent form default submission
    setLoading(true);
    setError("");

    try {
 
   await login(username, password);

      // alert("✅ Login successful!");
      nav("/"); // redirect user to homepage
    } catch (err) {
        console.error("Login failed:", JSON.stringify(err, null, 2));
        setError(err.detail || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    const loginResponse = await login(username, password);
    const user = loginResponse.user;
    const isAdmin = user.is_admin;

    // Redirect based on role
    if (isAdmin) {
      nav("/admin/dashboard"); // admin route
    } else {
      nav("/"); // regular user route
    }

  } catch (err) {
    console.error("Login failed:", err);
    setError(err.message || "Login failed");
  } finally {
    setLoading(false);
  }
};




  // ==============================
  // 🔹 Render login form
  // ==============================
  return (
    <div className="mx-auto grid max-w-md gap-4 px-4 py-12">
      <h1 className="text-2xl font-bold">Welcome back</h1>

      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Login form */}
      <form
        onSubmit={handleLogin}
        className="rounded-2xl border bg-white p-4 shadow-sm"
      >
        <label className="block text-sm font-medium">Username</label>
        <input
          type="text"
          className="mt-1 w-full rounded-xl border px-3 py-2"
          placeholder="yourusername"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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
          disabled={loading} // prevent double submissions
          className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {/* Signup link */}
      <p className="text-sm text-gray-600">
        No account?{" "}
        <Link to="/signup" className="font-semibold underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
