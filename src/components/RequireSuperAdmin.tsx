import { createContext, ReactNode, useContext } from "react";
import { Navigate, useLocation } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";

export type AdminScope = "full" | "moderation";

const REVIEWER_EMAIL = "apple-review@ajbn.co.uk";

const AdminScopeCtx = createContext<AdminScope | null>(null);

export function useAdminScope(): AdminScope {
  return useContext(AdminScopeCtx) ?? "full";
}

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

  let scope: AdminScope | null = null;
  if (isSuperAdmin) {
    scope = "full";
  } else if (user.email === REVIEWER_EMAIL) {
    scope = "moderation";
  }

  if (!scope) {
    return <Navigate to="/dashboard" replace />;
  }

  return <AdminScopeCtx.Provider value={scope}>{children}</AdminScopeCtx.Provider>;
}