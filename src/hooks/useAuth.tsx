import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "super_admin" | "ajbn_member" | "impact_lion" | "prospective_member";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  isSuperAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null, session: null, roles: [], isSuperAdmin: false, loading: true,
  signOut: async () => {},
});

const MOCK_KEY = "ajbn_demo_mock_user";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Demo mode: hydrate from mock user if present
    const mock = readMockUser();
    if (mock) {
      setUser(mock);
      setSession({ access_token: "demo", refresh_token: "demo", expires_in: 3600, token_type: "bearer", user: mock } as unknown as Session);
      setRoles(["ajbn_member"]);
      setLoading(false);
      return;
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        // defer role fetch
        setTimeout(() => fetchRoles(s.user.id), 0);
      } else {
        setRoles([]);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) {
        fetchRoles(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function fetchRoles(userId: string) {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    setRoles((data ?? []).map((r) => r.role as AppRole));
  }

  const signOut = async () => {
    localStorage.removeItem(MOCK_KEY);
    await supabase.auth.signOut();
    setRoles([]);
    setUser(null);
    setSession(null);
    window.location.href = "/";
  };

  return (
    <Ctx.Provider value={{
      user, session, roles,
      isSuperAdmin: roles.includes("super_admin"),
      loading, signOut,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);