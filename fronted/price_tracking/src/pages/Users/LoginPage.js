// // ==============================
// // 🔑 Login Page
// // ==============================
// // Allows user to log in, stores JWT token, and redirects to home page

// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { API } from "../../utils/api";
// import { apiFetch } from "../../utils/fetcher";
// import { useAuth } from "../../context/AuthContext";

// export default function LoginPage() {
//   const nav = useNavigate(); // used for programmatic navigation after login
//  const { login } = useAuth();
//   // ==============================
//   // 🔹 Local state
//   // ==============================
//   const [username, setUsername] = useState(""); // backend expects 'username' field
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false); // tracks API request
//   const [error, setError] = useState(""); // shows error messages

//   // ==============================
//   // 🔹 Login handler
//   // ==============================
//   const handleLogin1 = async (e) => {
//     e.preventDefault(); // prevent form default submission
//     setLoading(true);
//     setError("");

//     try {
 
//    await login(username, password);

//       // alert("✅ Login successful!");
//       nav("/"); // redirect user to homepage
//     } catch (err) {
//         console.error("Login failed:", JSON.stringify(err, null, 2));
//         setError(err.detail || err.message || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogin = async (e) => {
//   e.preventDefault();
//   setLoading(true);
//   setError("");

//   try {
//     const loginResponse = await login(username, password);
//     const user = loginResponse.user;
//     const isAdmin = user.is_admin;

//     // Redirect based on role
//     if (isAdmin) {
//       nav("/admin/dashboard"); // admin route
//     } else {
//       nav("/"); // regular user route
//     }

//   } catch (err) {
//     console.error("Login failed:", err);
//     setError(err.message || "Login failed");
//   } finally {
//     setLoading(false);
//   }
// };




//   // ==============================
//   // 🔹 Render login form
//   // ==============================
//   return (
//     <div className="mx-auto grid max-w-md gap-4 px-4 py-12">
//       <h1 className="text-2xl font-bold">Welcome back</h1>

//       {/* Error message */}
//       {error && (
//         <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
//           {error}
//         </div>
//       )}

//       {/* Login form */}
//       <form
//         onSubmit={handleLogin}
//         className="rounded-2xl border bg-white p-4 shadow-sm"
//       >
//         <label className="block text-sm font-medium">Username</label>
//         <input
//           type="text"
//           className="mt-1 w-full rounded-xl border px-3 py-2"
//           placeholder="yourusername"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           required
//         />

//         <label className="mt-4 block text-sm font-medium">Password</label>
//         <input
//           type="password"
//           className="mt-1 w-full rounded-xl border px-3 py-2"
//           placeholder="••••••••"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           required
//         />

//         <button
//           type="submit"
//           disabled={loading} // prevent double submissions
//           className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
//         >
//           {loading ? "Signing in…" : "Sign in"}
//         </button>
//       </form>

//       {/* Signup link */}
//       <p className="text-sm text-gray-600">
//         No account?{" "}
//         <Link to="/signup" className="font-semibold underline">
//           Create one
//         </Link>
//       </p>
//     </div>
//   );
// }


// --------------------------
// DeepSeek Code
// ----------------------------
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
  const [showPassword, setShowPassword] = useState(false); // toggle password visibility

  // ==============================
  // 🔹 Login handler
  // ==============================
  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const loginResponse = await login(username, password);
      const user = loginResponse.user;
      const isAdmin = user.is_admin || user.is_superuser || user.is_staff;

      console.log("Login successful, user:", user);
      console.log("Admin status:", isAdmin);

      // Redirect based on role
      if (isAdmin) {
        nav("/admin/dashboard", { replace: true }); // admin route
      } else {
        nav("/", { replace: true }); // regular user route
      }

    } catch (err) {
      console.error("Login failed:", err);
      
      // Handle different error formats
      let errorMessage = "Login failed";
      
      if (err.data) {
        // Handle structured error response
        if (typeof err.data === 'string') {
          errorMessage = err.data;
        } else if (err.data.detail) {
          errorMessage = err.data.detail;
        } else if (err.data.non_field_errors) {
          errorMessage = err.data.non_field_errors[0];
        }
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.detail) {
        errorMessage = err.detail;
      }
      
      // Specific error messages for common cases
      if (errorMessage.includes("No active account") || errorMessage.includes("Invalid credentials")) {
        errorMessage = "Invalid username or password";
      } else if (errorMessage.includes("Unable to log in")) {
        errorMessage = "Invalid login credentials";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin(e);
    }
  };

  // Clear error when user starts typing
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (error) setError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Demo credentials for testing (remove in production)
  const fillDemoCredentials = () => {
    setUsername("demo");
    setPassword("demo123");
    setError("");
  };

  // ==============================
  // 🔹 Render login form
  // ==============================
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue tracking prices
          </p>
        </div>

        {/* Demo credentials hint (remove in production) */}
        {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-700">
            💡 Demo: Use "demo / demo123" or your own credentials
          </p>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Fill demo credentials
          </button>
        </div> */}

        {/* Error message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Login form */}
        <form onSubmit={handleLogin} className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-sm border">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your username"
                value={username}
                onChange={handleUsernameChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="block w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePasswordChange}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !username.trim() || !password.trim()}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                Signing in...
              </div>
            ) : (
              "Sign in"
            )}
          </button>

          {/* Forgot password link (optional) */}
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-gray-600 hover:text-gray-900"
              onClick={() => setError("Password reset feature not implemented yet")}
            >
              Forgot your password?
            </button>
          </div>
        </form>

        {/* Signup link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link 
              to="/signup" 
              className="font-semibold text-gray-900 hover:text-gray-700 transition-colors"
            >
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}