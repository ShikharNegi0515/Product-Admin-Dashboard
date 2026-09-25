/**
 * Shared Axios instance.
 * - Attaches the auth token to every request via a request interceptor.
 * - Handles 401 errors centrally (clears auth and redirects to login).
 * - All API calls in the app use this instance, never the raw axios object.
 */

import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://dummyjson.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: attach Bearer token if one is stored in localStorage.
apiClient.interceptors.request.use(
  (config) => {
    // Only access localStorage in browser environments.
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 globally.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Token expired or invalid – clear stored auth and go to login.
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
