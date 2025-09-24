// -------------------------------
// React & Utils Imports
// -------------------------------
import { createContext, useContext, useMemo, useState } from "react"; // React hooks
import { apiFetch } from "../utils/fetcher"; // Custom fetch wrapper for API calls
import { API } from "../utils/api";           // API endpoint helpers

// -------------------------------
// Create Auth Context
// -------------------------------
const AuthContext = createContext(null); // Create a React context for authentication

// -------------------------------
// Custom Hook to Access Auth
// -------------------------------
export function useAuth() {
  // Allows any component to easily access auth state
  return useContext(AuthContext);
}

// -------------------------------
// AuthProvider Component
// -------------------------------
export function AuthProvider({ children }) {
  // ---------------------------
  // State
  // ---------------------------
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  

  // ---------------------------
  // Login Function
  // ---------------------------
  // const login = async (username, password) => {
  //   const data = { username, password };
  //   const res = await apiFetch(API.login(), "POST", data); // Call login API

  //   if (res.access) {
  //     // Store JWT token in localStorage and state
  //     localStorage.setItem("token", res.access);
  //     setToken(res.access);
  //   }

  //   // Fallback: use username if backend doesn’t return user info
  //   const userData = res.user || { username };
  //   setUser(userData);
  //   localStorage.setItem("user", JSON.stringify(userData));

  //   return res; // Return API response for further handling
  // };
  const login = async (username, password) => {
  try {
    const data = { username, password };
    const res = await apiFetch(API.login(), "POST", data);
    console.log("res ==> ", res)
    if (res.access) {
      localStorage.setItem("token", res.access);
      setToken(res.access);
    }
    const userData = res.user || { username };

    console.log("userData in login ", userData);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    return res;
  } catch (err) {
    // rethrow so login page can show err.data
    throw err;
  }
};


  // ---------------------------
  // Logout Function
  // ---------------------------
  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // Optional API logout call if endpoint exists
       // await apiFetch(API.logout?.(), "POST", null, () => token);
       if (API.logout) await apiFetch(API.logout(), "POST", null, () => token);

      }
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      // Clear localStorage and state
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  };

  // ---------------------------
  // Memoized Context Value
  // ---------------------------
  const value = useMemo(
    () => ({ token, user, login, logout, setUser }),
    [token, user]
  );

  // ---------------------------
  // Provide Context to Children
  // ---------------------------
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
