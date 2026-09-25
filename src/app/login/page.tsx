"use client";

/**
 * Login page.
 *
 * Uses POST /auth/login via auth.service.ts.
 * Guards:
 *  • If the user is already logged in, they are redirected to /products.
 *  • The submit button is disabled while the request is in flight to prevent
 *    double-submits (implemented with a useRef flag, not just useState,
 *    because setState is async and a second click can slip through).
 *  • Shows field-level and server-level error messages.
 */

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";

export default function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false); // Prevents rapid double-submit

  // Redirect already-authenticated users.
  useEffect(() => {
    if (!loading && user) {
      router.replace("/products");
    }
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;

    setError(null);

    // Basic client-side validation
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    inFlight.current = true;
    setSubmitting(true);

    try {
      await signIn(username.trim(), password);
      router.replace("/products");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setError("Invalid username or password. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      inFlight.current = false;
      setSubmitting(false);
    }
  }

  if (loading) return null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      {/* Background gradient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-sky-600/10 blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-slideUp">
        {/* Card */}
        <div className="rounded-2xl bg-zinc-900/80 border border-zinc-700/60 shadow-2xl backdrop-blur-sm p-8">
          {/* Logo + Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Product Admin
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Sign in to manage your products
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400 animate-slideUp"
            >
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="login-username"
                className="block text-sm font-medium text-zinc-300 mb-1.5"
              >
                Username
              </label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="emilys"
                disabled={submitting}
                className="w-full px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                aria-required="true"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-zinc-300 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={submitting}
                  className="w-full px-3 py-2.5 pr-10 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Hint */}
          <p className="mt-6 text-center text-xs text-zinc-500">
            Use{" "}
            <code className="text-zinc-400 bg-zinc-800 px-1 py-0.5 rounded">
              emilys
            </code>{" "}
            /{" "}
            <code className="text-zinc-400 bg-zinc-800 px-1 py-0.5 rounded">
              emilyspass
            </code>
          </p>
        </div>
      </div>
    </main>
  );
}
