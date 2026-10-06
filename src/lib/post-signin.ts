// After an OAuth return (Apple/Google), send members with no business name or
// service category to /complete-profile; otherwise honour the saved destination.
import { supabase } from "@/integrations/supabase/client";

const KEY = "ajbn_oauth_next";

export function markOAuthPending(next?: string) {
  try { sessionStorage.setItem(KEY, next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"); } catch { /* ignore */ }
}

export function needsCompletion(p: { company?: string | null; pending_company_name?: string | null; primary_sector?: string | null } | null | undefined) {
  return !((p?.company || p?.pending_company_name || "").trim()) || !(p?.primary_sector || "").trim();
}

export async function routeAfterOAuth(userId: string) {
  let next: string | null = null;
  try { next = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); } catch { /* ignore */ }
  if (!next) return;
  const { data: p } = await supabase.from("profiles").select("company, pending_company_name, primary_sector").eq("id", userId).maybeSingle();
  const dest = needsCompletion(p) ? "/complete-profile" : next;
  if (window.location.pathname !== dest) window.location.replace(dest);
}
