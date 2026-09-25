"use client";

/**
 * Login page — full redesign.
 * Premium glassmorphism card, animated indigo/violet blob background,
 * subtle grid pattern overlay, gradient-border wrapper, uppercase labels.
 */

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
// `axios` is imported here solely for the `isAxiosError` static type-guard.
// No API calls are made from this file directly — signIn() in AuthContext uses apiClient.
import axios from "axios";

export default function LoginPage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("emilys");
  const [password, setPassword] = useState("emilyspass");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inFlight = useRef(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/products");
    }
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (inFlight.current) return;

    setError(null);

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
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4 overflow-hidden">
      {/* ── Animated background ─────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none select-none">
        {/* Emerald aurora blob — top-left */}
        <div
          className="absolute -top-72 -left-72 w-[700px] h-[700px] rounded-full
                     bg-emerald-300/30 blur-[120px] animate-float"
        />
        {/* Teal aurora blob — bottom-right (offset phase) */}
        <div
          className="absolute -bottom-72 -right-72 w-[600px] h-[600px] rounded-full
                     bg-teal-300/20 blur-[120px] animate-float"
          style={{ animationDelay: "-3.5s" }}
        />
        {/* Subtle dot-grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(148,163,184,1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <div className="w-full max-w-sm animate-slideUp relative z-10">
        {/* Gradient border wrapper */}
        <div className="p-px rounded-2xl bg-gradient-to-br from-emerald-300/60 via-teal-300/30 to-transparent shadow-2xl shadow-emerald-500/10">
          <div className="rounded-2xl bg-white/80 backdrop-blur-2xl p-8 border border-white/50">

            {/* Logo + title */}
            <div className="flex flex-col items-center mb-8">
              {/* Glow behind the icon */}
              <div className="relative mb-4">
                <div className="absolute inset-0 rounded-2xl bg-emerald-500/30 blur-xl scale-125" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400
                                flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0
                         01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0
                         1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621
                         0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Product Admin
              </h1>
              <p className="text-sm text-slate-500 mt-1.5">
                Sign in to manage your catalog
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20
                           p-3.5 text-sm text-red-400 animate-slideUp flex items-start gap-2.5"
              >
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667
                       1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34
                       16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Username */}
              <div>
                <label
                  htmlFor="login-username"
                  className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2"
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
                  className="w-full px-4 py-3 rounded-xl bg-slate-50/50 border border-slate-200
                             text-slate-800 placeholder-slate-400 text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500
                             transition-all duration-200 disabled:opacity-50"
                  aria-required="true"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="login-password"
                  className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2"
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
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-50/50 border border-slate-200
                               text-slate-800 placeholder-slate-400 text-sm
                               focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500
                               transition-all duration-200 disabled:opacity-50"
                    aria-required="true"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1
                               text-slate-500 hover:text-slate-300 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993
                             0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773
                             3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3
                             3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0
                             0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638
                             0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64
                             19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
                className="w-full py-3 mt-1 rounded-xl font-semibold text-sm text-white transition-all duration-200
                           bg-gradient-to-r from-emerald-500 to-teal-400
                           hover:from-emerald-400 hover:to-teal-300
                           shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40
                           disabled:opacity-60 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
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

            {/* Credentials hint */}
            <p className="mt-6 text-center text-xs text-slate-500">
              Use{" "}
              <code className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md font-semibold">emilys</code>
              {" / "}
              <code className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md font-semibold">emilyspass</code>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
