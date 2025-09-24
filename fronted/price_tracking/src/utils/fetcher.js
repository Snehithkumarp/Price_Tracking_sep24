// -------------------------------
// Generic API Fetch Utility
// -------------------------------
export async function apiFetch(url, method = "GET", data = null, getToken) {
  // ---------------------------
  // Token Handling
  // ---------------------------
  // If getToken is a function, call it to retrieve token (e.g., JWT from AuthContext)
  const token = typeof getToken === "function" ? getToken() : getToken;

  // ---------------------------
  // Headers
  // ---------------------------
  const headers = {
    "Content-Type": "application/json",              // Always send JSON
    ...(token ? { Authorization: `Bearer ${token}` } : {}), // Add Authorization header if token exists
  };

  // ---------------------------
  // Request Options
  // ---------------------------
  const opts = {
    method,                  // HTTP method (GET, POST, etc.)
    headers,                 // Headers object
    credentials: "include",  // Include cookies (if needed)
    ...(data ? { body: JSON.stringify(data) } : {}), // Include body if data exists
  };

  // ---------------------------
  // Fetch API Request
  // ---------------------------
  const res = await fetch(url, opts);

  // ---------------------------
  // Error Handling
  // ---------------------------
  if (!res.ok) {
    const text = await res.text();                  // Try to get error message from response
    throw new Error(text || `Request failed: ${res.status}`);
  }

  // ---------------------------
  // Response Parsing
  // ---------------------------
  const ct = res.headers.get("content-type");
  if (ct && ct.includes("application/json")) {
    return res.json(); // Parse JSON if response is JSON
  }
  return res.text();    // Otherwise, return plain text
}



