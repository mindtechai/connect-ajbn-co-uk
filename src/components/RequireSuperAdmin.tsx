import { ReactNode } from "react";
import { Navigate, useLocation } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";

export function RequireSuperAdmin({ children }: { children: ReactNode }) {
  const { user, isSuperAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) {
    // Keep the intended admin destination so sign-in lands there (e.g. links
    // in the admin summary email opened while signed out).
    const intended = `${location.pathname}${location.search ?? ""}`;
    return (
      <Navigate
        to={`/login?next=${encodeURIComponent(intended)}`}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  if (!isSuperAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}