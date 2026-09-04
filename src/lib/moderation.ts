// Member-safety data layer: blocks and abuse reports.
// Source of truth is the backend (member_blocks / member_reports); a local
// cache keeps the UI instant and readable offline / in demo mode.

import { supabase } from "@/integrations/supabase/client";

const BLOCK_KEY = "ajbn_blocked_members_v1";
const REPORT_KEY = "ajbn_member_reports_v1";

export type MemberReport = {
  id: string;
  target_id: string;
  target_name: string | null;
  reason: string;
  details: string;
  context: "chat" | "profile";
  created_at: string;
};

export const REPORT_REASONS = [
  "Harassment or bullying",
  "Spam or unsolicited selling",
  "Scam, fraud or misleading offer",
  "Inappropriate or offensive content",
  "Impersonation or fake profile",
  "Other concern",
] as const;

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — non-fatal */
  }
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Demo/placeholder member ids aren't valid backend member accounts. */
function isRealMemberId(id: string): boolean {
  return UUID_RE.test(id);
}

async function requireAuthenticatedUser(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new Error("Please sign in with your AJBN Connect account to use member safety tools.");
  }
  return data.user.id;
}

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ajbn-moderation-changed"));
  }
}

/** Cached block list — synchronous, used for rendering. */
export function listBlocked(): string[] {
  return readList<string>(BLOCK_KEY);
}

export function isBlocked(userId?: string | null): boolean {
  if (!userId) return false;
  return listBlocked().includes(userId);
}

/** Pull the authoritative block list from the backend into the cache. */
export async function syncBlocked(): Promise<string[]> {
  const { data: auth } = await supabase.auth.getUser();
  const me = auth?.user?.id;
  if (!me) return [];
  const { data, error } = await supabase
    .from("member_blocks")
    .select("blocked_id")
    .eq("blocker_id", me);
  if (error) return listBlocked();
  const ids = (data ?? []).map((r) => r.blocked_id);
  write(BLOCK_KEY, ids);
  emit();
  return ids;
}

export async function blockMember(userId: string): Promise<void> {
  const me = await requireAuthenticatedUser();
  if (!isRealMemberId(userId)) throw new Error("This demo profile cannot be blocked.");
  const { error } = await supabase
    .from("member_blocks")
    .insert({ blocker_id: me, blocked_id: userId });
  // Duplicate block (already blocked) is not an error for the user.
  if (error && error.code !== "23505") throw new Error(error.message);
  write(BLOCK_KEY, Array.from(new Set([...listBlocked(), userId])));
  emit();
}

export async function unblockMember(userId: string): Promise<void> {
  const me = await requireAuthenticatedUser();
  if (!isRealMemberId(userId)) throw new Error("This demo profile cannot be unblocked.");
  const { error } = await supabase
    .from("member_blocks")
    .delete()
    .eq("blocker_id", me)
    .eq("blocked_id", userId);
  if (error) throw new Error(error.message);
  write(BLOCK_KEY, listBlocked().filter((id) => id !== userId));
  emit();
}

export function listReports(): MemberReport[] {
  return readList<MemberReport>(REPORT_KEY);
}

export async function reportMember(
  input: Omit<MemberReport, "id" | "created_at">,
): Promise<MemberReport> {
  const me = await requireAuthenticatedUser();
  const { data, error } = await supabase
    .from("member_reports")
    .insert({
      reporter_id: me,
      target_id: isRealMemberId(input.target_id) ? input.target_id : null,
      target_name: input.target_name,
      reason: input.reason,
      details: input.details,
      context: input.context,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("The report could not be saved. Please try again.");

  const report: MemberReport = { ...input, id: data.id, created_at: new Date().toISOString() };
  write(REPORT_KEY, [report, ...listReports()].slice(0, 200));
  emit();
  return report;
}
