// // ==============================
// // 📌 Signup Page
// // ==============================
// // Allows users to create an account and redirects them to login after success

// import { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { apiFetch } from "../../utils/fetcher";
// import { API } from "../../utils/api";

// export default function SignupPage() {
//   const nav = useNavigate(); // react-router navigation
//   const [username, setUsername] = useState(""); // backend expects username
//   const [email, setEmail] = useState(""); // email input
//   const [password, setPassword] = useState(""); // password input
//   const [loading, setLoading] = useState(false); // loading state during API call
//   const [error, setError] = useState(""); // error message

//   // ==============================
//   // 🔹 Handle signup form submission
//   // ==============================
//   const handleSignup = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     const data = { username, email, password }; // prepare payload
//     //   try {
//     //     // Call backend signup API
//     //     await apiFetch(API.signup(), "POST", data);
//     //     alert("✅ Signup successful! Please log in.");
//     //     nav("/login"); // redirect to login page
//     //   } catch (err) {
//     //     console.error("Signup failed:", err);
//     //     setError(err.response?.data?.detail || "Signup failed"); // show error from backend
//     //   } finally {
//     //     setLoading(false); // stop loading
//     //   }
//     // };
//     // inside SignupPage, update catch block:
//     try {
//       await apiFetch(API.signup(), "POST", data);
//       alert("✅ Signup successful! Please log in.");
//       nav("/login");
//     } catch (err) {
//       console.error("Signup failed:", err);

//       let backendMsg = "Signup failed";

//       if (err?.data) {
//         if (typeof err.data === "object" && !Array.isArray(err.data)) {
//           backendMsg = Object.entries(err.data)
//             .map(([field, messages]) => {
//               if (Array.isArray(messages)) {
//                 return `${field}: ${messages.join(", ")}`;
//               }
//               return `${field}: ${messages}`;
//             })
//             .join("\n \n"); // 👈 puts each error on a new line
//         } else if (err.data.detail) {
//           backendMsg = err.data.detail;
//         } else {
//           backendMsg = JSON.stringify(err.data);
//         }
//       } else if (err.message) {
//         backendMsg = err.message;
//       }

//       setError(backendMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">Signup</h1>
//         </div>
//         <div className="text-center py-12">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//           <p className="mt-4 text-gray-600">Signup...</p>
//         </div>
//       </div>
//     );
//   }

//   // ==============================
//   // 🔹 Render Signup Form
//   // ==============================
//   return (
//     <div className="mx-auto grid max-w-md gap-4 px-4 py-12">
//       <h1 className="text-2xl font-bold">Create your account</h1>

//       {/* Error message */}
//       {error && (
//         <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
//           {error}
//         </div>
//       )}

//       {/* Signup form */}
//       <form
//         onSubmit={handleSignup}
//         className="rounded-2xl border bg-white p-4 shadow-sm"
//       >
//         <label className="block text-sm font-medium">Username</label>
//         <input
//           type="text"
//           className="mt-1 w-full rounded-xl border px-3 py-2"
//           placeholder="arya"
//           value={username}
//           onChange={(e) => setUsername(e.target.value)}
//           required
//         />

//         <label className="mt-4 block text-sm font-medium">Email</label>
//         <input
//           type="email"
//           className="mt-1 w-full rounded-xl border px-3 py-2"
//           placeholder="you@example.com"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
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
//           disabled={loading}
//           className="mt-6 w-full rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
//         >
//           {loading ? "Creating…" : "Create account"}
//         </button>
//       </form>

//       {/* Link to login */}
//       <p className="text-sm text-gray-600">
//         Already have an account?{" "}
//         <Link to="/login" className="font-semibold underline">
//           Sign in
//         </Link>
//       </p>
//     </div>
//   );
// }

// ------------------------------------
// DeepSeek Code
// --------------------------------


// ==============================
// 📌 Signup Page
// ==============================
// Allows users to create an account and redirects them to login after success

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../../utils/fetcher";
import { API } from "../../utils/api";

export default function SignupPage() {
  const nav = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // ==============================
  // 🔹 Handle form input changes
  // ==============================
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (error) setError("");

    // Check password strength in real-time
    if (field === 'password') {
      checkPasswordStrength(value);
    }
  };

  // ==============================
  // 🔹 Password strength checker
  // ==============================
  const checkPasswordStrength = (password) => {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;
    
    // Contains numbers
    if (/\d/.test(password)) strength += 1;
    
    // Contains special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  };

  // ==============================
  // 🔹 Password strength indicator
  // ==============================
  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "Enter password";
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Medium";
    return "Strong";
  };

  // ==============================
  // 🔹 Form validation
  // ==============================
  const validateForm = () => {
    if (!formData.username.trim() || !formData.email.trim() || !formData.password) {
      setError("Please fill in all fields");
      return false;
    }

    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters long");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    if (passwordStrength < 3) {
      setError("Please choose a stronger password");
      return false;
    }

    return true;
  };

  // ==============================
  // 🔹 Handle signup form submission
  // ==============================
  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    const data = { 
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password
    };

    try {
      await apiFetch(API.signup(), "POST", data);
      
      // Success - redirect to login with success message
      nav("/login", { 
        state: { 
          message: "✅ Signup successful! Please log in to continue." 
        } 
      });
      
    } catch (err) {
      console.error("Signup failed:", err);

      let backendMsg = "Signup failed. Please try again.";

      if (err?.data) {
        if (typeof err.data === "object" && !Array.isArray(err.data)) {
          // Handle Django error format
          backendMsg = Object.entries(err.data)
            .map(([field, messages]) => {
              const fieldName = field === 'username' ? 'Username' : 
                              field === 'email' ? 'Email' : 
                              field === 'password' ? 'Password' : field;
              if (Array.isArray(messages)) {
                return `${fieldName}: ${messages.join(", ")}`;
              }
              return `${fieldName}: ${messages}`;
            })
            .join("\n");
        } else if (err.data.detail) {
          backendMsg = err.data.detail;
        } else if (typeof err.data === 'string') {
          backendMsg = err.data;
        }
      } else if (err.message) {
        backendMsg = err.message;
      }

      setError(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // 🔹 Toggle password visibility
  // ==============================
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // ==============================
  // 🔹 Demo data for testing
  // ==============================
  const fillDemoData = () => {
    setFormData({
      username: "demo_user",
      email: "demo@example.com",
      password: "Demo123!",
      confirmPassword: "Demo123!"
    });
    setError("");
  };

  // ==============================
  // 🔹 Render Signup Form
  // ==============================
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Start tracking prices and save money
          </p>
        </div>

        {/* Demo data hint (remove in production) */}
        {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-700">
            💡 Need test data? Fill demo credentials
          </p>
          <button
            type="button"
            onClick={fillDemoData}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Fill demo data
          </button>
        </div> */}

        {/* Error message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 whitespace-pre-line">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Signup form */}
        <form onSubmit={handleSignup} className="mt-8 space-y-6 bg-white p-8 rounded-2xl shadow-sm border">
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username *
              </label>
              <input
                id="username"
                type="text"
                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your username (min 3 characters)"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                id="email"
                type="email"
                className="mt-1 block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password *
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="block w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter a strong password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
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
              
              {/* Password strength indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Password strength:</span>
                    <span className={`font-medium ${
                      passwordStrength <= 2 ? 'text-red-600' :
                      passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password *
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className="block w-full px-3 py-3 pr-10 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? (
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

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                Creating account...
              </div>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        {/* Login link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link 
              to="/login" 
              className="font-semibold text-gray-900 hover:text-gray-700 transition-colors"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}