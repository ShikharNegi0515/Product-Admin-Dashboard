"use client";

/**
 * ProtectedRoute – wraps any page that requires authentication.
 *
 * While the auth state is loading (initial mount / localStorage hydration)
 * it shows a full-screen spinner so there is no flash of unauthenticated
 * content. Once loaded:
 *  • Authenticated  → renders children.
 *  • Unauthenticated → redirects to /login.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <LoadingSpinner size="lg" label="Authenticating…" />
      </div>
    );
  }

  if (!user) {
    // Rendering null while the redirect fires prevents a brief flash.
    return null;
  }

  return <>{children}</>;
}
