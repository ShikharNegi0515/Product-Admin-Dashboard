"use client";

/**
 * Navbar – redesigned with gradient top-border, indigo-tinted brand, and
 * user avatar with a gradient ring.
 */

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-4 sm:px-6
                       bg-white/80 backdrop-blur-xl border-b border-slate-200 relative">
      {/* Gradient top-border line — subtle but premium */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400
                        flex items-center justify-center shadow-md shadow-emerald-500/20">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0
                 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0
                 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621
                 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <span className="font-bold text-slate-800 text-sm tracking-tight hidden sm:block">
          Product{" "}
          <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
            Admin
          </span>
        </span>
      </div>

      {/* Right side */}
      {user && (
        <div className="flex items-center gap-3">
          {/* User info */}
          <div className="hidden sm:flex items-center gap-2.5">
            {user.image && (
              /* Avatar with gradient ring */
              <div className="p-px rounded-full bg-gradient-to-br from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/15">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-100">
                  <Image
                    src={user.image}
                    alt={`${user.firstName} ${user.lastName}`}
                    fill
                    sizes="32px"
                    className="object-contain"
                  />
                </div>
              </div>
            )}
            <div className="leading-none">
              <p className="text-xs font-semibold text-slate-700">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={signOut}
            id="logout-button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                       border border-slate-200 text-slate-500
                       hover:text-slate-800 hover:bg-slate-50 hover:border-slate-300
                       text-sm transition-all duration-150"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25
                   2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0
                   002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span className="hidden sm:inline text-xs font-medium">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}
