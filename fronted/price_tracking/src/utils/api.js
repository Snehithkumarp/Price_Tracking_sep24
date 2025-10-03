// -------------------------------
// Axios Import
// -------------------------------
//import axios from "axios"; // Optional: may use for requests if not using custom fetcher

// -------------------------------
// Base API URL
// -------------------------------
export const API_BASE = "http://127.0.0.1:8000"; 
// Central base URL for all backend endpoints
// Change this if deploying to production

// -------------------------------
// API Endpoints Helper
// -------------------------------
export const API = {

  products: () => `${API_BASE}/api/products/`,
  trackedProducts: () => `${API_BASE}/api/tracked-products/`,
  adminTrackedProducts: () => `${API_BASE}/api/tracked-products/all/`,
  users: () => `${API_BASE}/api/users/`,
  adminPriceHistory: () => `${API_BASE}/api/price-history/`,
  // ---------- Auth ----------
 // signup: () => `${API_BASE}/api/auth/signup/`, // Register a new user
  signup: () => `${API_BASE}/api/auth/signup/`,

  login: () => `${API_BASE}/api/auth/login/`,   // Login user and return JWT token

  dashboardStats: () => `${API_BASE}/dashboard/stats/`,
  // ---------- Product ----------
  recentlyDropped: () => `${API_BASE}/api/products/recently-dropped/`,
  search: (q) => `${API_BASE}/api/products/?search=${encodeURIComponent(q)}`, 
  // Search products by query `q`, properly URL-encoded

  product: (id) => `${API_BASE}/api/products/${id}/`, 
  // Get details of a product by ID

  priceHistory: (id) => `${API_BASE}/api/products/${id}/history/`, 
  // Get price history of a product by ID

  // ---------- Price Alerts ----------
  alerts: {
    list: () => `${API_BASE}/api/alerts/`,          // List all alerts
    create: () => `${API_BASE}/api/alerts/`,        // Create a new alert
    retrieve: (id) => `${API_BASE}/api/alerts/${id}/`, // Retrieve alert details by ID
    update: (id) => `${API_BASE}/api/alerts/${id}/`,   // Update an alert by ID
    delete: (id) => `${API_BASE}/api/alerts/${id}/`,   // Delete an alert by ID
  },
};

// src/utils/api.js

export async function apiFetch(url, method = "GET", body = null, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!response.ok) {
    let errorText = "API request failed";
    try {
      const errorData = await response.json();
      errorText = errorData.detail || JSON.stringify(errorData);
    } catch (err) {
      // fallback to default error text
    }
    throw new Error(errorText);
  }

  return await response.json();
}
