/**
 * Auth service – all authentication-related API calls.
 *
 * login()   → POST /auth/login
 *
 * We deliberately keep these calls in this file so that UI components
 * never import axios directly.
 */

import apiClient from "@/lib/axios";
import type { AuthUser } from "@/types/auth";

interface LoginPayload {
  username: string;
  password: string;
  expiresInMins?: number;
}

/**
 * Attempt to log in.
 * On success the token is stored in localStorage so the Axios interceptor
 * can attach it to subsequent requests.
 */
export async function login(
  username: string,
  password: string
): Promise<AuthUser> {
  const payload: LoginPayload = {
    username,
    password,
    expiresInMins: 60,
  };

  const { data } = await apiClient.post<AuthUser>("/auth/login", payload);

  // Persist token and user info for the interceptor and app-wide use.
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", data.accessToken);
    localStorage.setItem("auth_user", JSON.stringify(data));
  }

  return data;
}

/**
 * Clear auth state and redirect to the login page.
 */
export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    window.location.href = "/login";
  }
}

/**
 * Read the stored user from localStorage (synchronous, safe for SSR check).
 */
export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

/**
 * Returns true when there is a token in localStorage.
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("auth_token"));
}
