import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "super_admin" | "ajbn_member" | "impact_lion" | "prospective_member";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  isSuperAdmin: boolean;
  /** True once the role lookup for the current user has finished. */
  rolesLoaded: boolean;
  /** Single source of truth for member-only areas: approved flag OR member role. */
  isApprovedMember: boolean;
  loading: boolean;
  refreshAccess: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null, session: null, roles: [], isSuperAdmin: false, rolesLoaded: false, isApprovedMember: false, loading: true,
  refreshAccess: async () => {},
  signOut: async () => {},
});

const MOCK_KEY = "ajbn_demo_mock_user";
const SIGNUP_NOTIFIED_KEY = "ajbn_signup_notified";

/**
 * Covers sign-ups that never touch the registration form (Google sign-in).
 * The server only emails when the profile was created in the last 24 hours and
 * uses idempotency keys, so existing members are never emailed again.
 */
function notifyIfNewSignup(userId: string) {
  try {
    if (localStorage.getItem(SIGNUP_NOTIFIED_KEY) === userId) return;
    localStorage.setItem(SIGNUP_NOTIFIED_KEY, userId);
  } catch { /* storage unavailable - still attempt once */ }
  void import("@/lib/signup-notify.functions")
    .then(({ notifyNewSignup }) => notifyNewSignup({ data: { memberId: userId } }))
    .catch(() => {});
}

function readMockUser(): User | null {
  try {
    const raw = localStorage.getItem(MOCK_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [approvedFlag, setApprovedFlag] = useState(false);
  const [loading, setLoading] = useState(true);
  // Access decisions (admin areas) must wait for this, never for `loading`
  // alone: a signed-in user with roles still in flight is not "no roles".
  const [rolesLoaded, setRolesLoaded] = useState(false);
  // Invalidates role responses from an older session or an overlapping
  // refresh so stale access cannot overwrite the current signed-in user.
  const roleRequestRef = useRef(0);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      if (s?.user) {
        localStorage.removeItem(MOCK_KEY);
        if (_evt === "SIGNED_IN") notifyIfNewSignup(s.user.id);
        setSession(s);
        setUser(s.user);
        setRoles([]);
        setApprovedFlag(false);
        setRolesLoaded(false);
        void fetchRoles(s.user.id).finally(() => setLoading(false));
      } else {
        roleRequestRef.current += 1;
        const mock = readMockUser();
        setSession(mock
          ? ({ access_token: "demo", refresh_token: "demo", expires_in: 3600, token_type: "bearer", user: mock } as unknown as Session)
          : null);
        setUser(mock);
        setRoles(mock ? ["ajbn_member"] : []);
        setApprovedFlag(!!mock);
        setRolesLoaded(true);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) {
        localStorage.removeItem(MOCK_KEY);
        setSession(data.session);
        setUser(data.session.user);
        setRoles([]);
        setApprovedFlag(false);
        setRolesLoaded(false);
        fetchRoles(data.session.user.id).finally(() => setLoading(false));
      } else {
        roleRequestRef.current += 1;
        const mock = readMockUser();
        setSession(mock
          ? ({ access_token: "demo", refresh_token: "demo", expires_in: 3600, token_type: "bearer", user: mock } as unknown as Session)
          : null);
        setUser(mock);
        setRoles(mock ? ["ajbn_member"] : []);
        setApprovedFlag(!!mock);
        setRolesLoaded(true);
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function fetchRoles(userId: string, attempt = 0, requestId?: number): Promise<void> {
    const activeRequestId = requestId ?? ++roleRequestRef.current;
    if (requestId === undefined) setRolesLoaded(false);

    const [{ data: roleRows, error: roleError }, { data: profile }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId),
      supabase.from("profiles").select("is_approved, deleted_at").eq("id", userId).maybeSingle(),
    ]);
    if (activeRequestId !== roleRequestRef.current) return;
    if (roleError) {
      // Never silently downgrade access on a transient failure. Keep the
      // guard loading instead of treating a failed lookup as "not admin".
      console.error("[auth] role lookup failed", roleError);
      if (attempt < 1) {
        await new Promise((r) => setTimeout(r, 600));
        if (activeRequestId !== roleRequestRef.current) return;
        return fetchRoles(userId, attempt + 1, activeRequestId);
      }
      return;
    }
    const nextRoles = (roleRows ?? []).map((r) => r.role as AppRole);
    console.info("[auth] admin role:", nextRoles.includes("super_admin") ? "super_admin" : null);
    setRoles(nextRoles);
    setApprovedFlag(!!profile?.is_approved && !profile?.deleted_at);
    setRolesLoaded(true);
  }

  // Approval granted by an admin takes effect on the next app open/focus,
  // without the member having to sign out and back in.
  const refreshAccess = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) await fetchRoles(data.session.user.id);
  };

  useEffect(() => {
    if (!user) return;
    const onFocus = () => { if (document.visibilityState === "visible") void refreshAccess(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [user?.id]);

  const signOut = async () => {
    localStorage.removeItem(MOCK_KEY);
    await supabase.auth.signOut();
    setRoles([]);
    setApprovedFlag(false);
    setUser(null);
    setSession(null);
    window.location.href = "/";
  };

  return (
    <Ctx.Provider value={{
      user, session, roles,
      isSuperAdmin: roles.includes("super_admin"),
      rolesLoaded,
      isApprovedMember:
        approvedFlag ||
        roles.includes("ajbn_member") ||
        roles.includes("impact_lion") ||
        roles.includes("super_admin"),
      loading, refreshAccess, signOut,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);