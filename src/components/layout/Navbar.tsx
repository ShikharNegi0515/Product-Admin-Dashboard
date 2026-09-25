"use client";

/**
 * Navbar – top navigation bar shown on all authenticated pages.
 *
 * Shows the app logo/name, current user avatar, and a Logout button.
 */

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

export default function Navbar() {
  const { user, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center justify-between px-4 sm:px-6 border-b border-zinc-700/60 bg-zinc-900/80 backdrop-blur-md">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <span className="font-semibold text-zinc-200 text-base hidden sm:block">
          Product Admin
        </span>
      </div>

      {/* Right side */}
      {user && (
        <div className="flex items-center gap-3">
          {/* User info */}
          <div className="hidden sm:flex items-center gap-2.5">
            {user.image && (
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-600 bg-white">
                <Image
                  src={user.image}
                  alt={`${user.firstName} ${user.lastName}`}
                  fill
                  sizes="32px"
                  className="object-contain"
                />
              </div>
            )}
            <div className="leading-none">
              <p className="text-xs font-medium text-zinc-200">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">{user.email}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={signOut}
            id="logout-button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      )}
    </header>
  );
}
