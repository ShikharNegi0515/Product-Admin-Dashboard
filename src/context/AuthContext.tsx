"use client";

/**
 * AuthContext – app-wide authentication state.
 *
 * Provides:
 *  • user    – the current AuthUser (or null when logged out)
 *  • loading – true while we are reading localStorage on mount
 *  • signIn  – call login() and update state
 *  • signOut – call logout() and update state
 *
 * Using a context (rather than reading localStorage inline) lets every
 * component react to auth changes without prop-drilling.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { login, logout, getStoredUser } from "@/services/auth.service";
import type { AuthUser } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  // Start as "loading" so we don't flash the login page on refresh.
  const [loading, setLoading] = useState(true);

  // On mount, hydrate from localStorage.
  useEffect(() => {
    const stored = getStoredUser();
    setUser(stored);
    setLoading(false);
  }, []);

  const signIn = useCallback(async (username: string, password: string) => {
    const authUser = await login(username, password);
    setUser(authUser);
  }, []);

  const signOut = useCallback(() => {
    logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
