// // -------------------------------
// // Generic API Fetch Utility
// // -------------------------------
// export async function apiFetch(url, method = "GET", data = null, getToken) {
//   // ---------------------------
//   // Token Handling
//   // ---------------------------
//   // If getToken is a function, call it to retrieve token (e.g., JWT from AuthContext)
//   const token = typeof getToken === "function" ? getToken() : getToken;

//   // ---------------------------
//   // Headers
//   // ---------------------------
//   const headers = {
//     "Content-Type": "application/json",              // Always send JSON
//     ...(token ? { Authorization: `Bearer ${token}` } : {}), // Add Authorization header if token exists
//   };

//   // ---------------------------
//   // Request Options
//   // ---------------------------
//   const opts = {
//     method,                  // HTTP method (GET, POST, etc.)
//     headers,                 // Headers object
//     credentials: "include",  // Include cookies (if needed)
//     ...(data ? { body: JSON.stringify(data) } : {}), // Include body if data exists
//   };

//   // ---------------------------
//   // Fetch API Request
//   // ---------------------------
//   const res = await fetch(url, opts);

//   // ---------------------------
//   // Error Handling
//   // ---------------------------
//   if (!res.ok) {
//     const text = await res.text();                  // Try to get error message from response
//     throw new Error(text || `Request failed: ${res.status}`);
//   }

//   // ---------------------------
//   // Response Parsing
//   // ---------------------------
//   const ct = res.headers.get("content-type");
//   if (ct && ct.includes("application/json")) {
//     return res.json(); // Parse JSON if response is JSON
//   }
//   return res.text();    // Otherwise, return plain text
// }


//----------------------------------------------------------------------------------

// export async function apiFetch(url, method = "GET", body = null) {
//   const token = localStorage.getItem("token");  // fetch token here
//   const headers = {
//     "Content-Type": "application/json",
//   };

//   // Get token from localStorage if not provided
//   const accessToken = token || localStorage.getItem("token");
//   if (accessToken) {
//     headers["Authorization"] = `Bearer ${token}`; // ✅ must include "Bearer "
//   }

//   const res = await fetch(url, {
//     method,
//     headers,
//     body: body ? JSON.stringify(body) : null,
//   });

// //   if (!res.ok) {
// //     const errData = await res.json();
// //     throw errData;
// //   }

// //   return res.json();
// // }
//   if (!res.ok) {
//     let errData;
//     try {
//       errData = await res.json();
//     } catch {
//       errData = await res.text(); // fallback for empty error response
//     }
//     throw errData;
//   }

//   // ✅ If backend sends no content (e.g., DELETE → 204), return null
//   if (res.status === 204) {
//     return null;
//   }

//   return res.json();
// }

// export async function apiFetch(url, method = "GET", body = null) {
//   const token = localStorage.getItem("token");
//   const headers = {
//     "Content-Type": "application/json",
//   };

//   if (token) {
//     headers["Authorization"] = `Bearer ${token}`;
//   }

//   const fetchOptions = { method, headers };
//   if (body && method !== "GET") {
//     fetchOptions.body = JSON.stringify(body);
//   }

//   const res = await fetch(url, fetchOptions);

//   if (!res.ok) {
//     let errData;
//     try {
//       errData = await res.json();
//     } catch {
//       errData = await res.text();
//     }
//     throw new Error(typeof errData === "string" ? errData : JSON.stringify(errData));
//   }

//   if (res.status === 204) return null;

//   return res.json();
// }

export async function apiFetch(url, method = "GET", body = null) {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const fetchOptions = {
    method,
    headers,
    ...(body && method !== "GET" ? { body: JSON.stringify(body) } : {}),
  };

  // 🔍 Debug: see if token is actually sent
  if (process.env.NODE_ENV === "development") {
    console.log("[apiFetch] Request:", url, fetchOptions);
  }

  const res = await fetch(url, fetchOptions);

  if (!res.ok) {
    let errData;
    try {
      errData = await res.json();
    } catch {
      errData = await res.text();
    }

    // Keep errors structured for better handling
    throw {
      status: res.status,
      data: errData,
    };
  }

  // ✅ Handle 204 (No Content) gracefully
  if (res.status === 204) return null;

  return res.json();
}


