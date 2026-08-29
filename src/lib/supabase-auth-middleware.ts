import { createMiddleware } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

/**
 * Client-side function middleware: attaches the current Supabase access token
 * as an Authorization header on every server-function RPC, so server-side
 * auth checks can verify the caller.
 */
export const attachSupabaseAuth = createMiddleware({ type: "function" }).client(
  async ({ next }) => {
    let token: string | undefined;
    if (typeof window !== "undefined") {
      const { data } = await supabase.auth.getSession();
      token = data.session?.access_token;
    }
    return next({
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  },
);
