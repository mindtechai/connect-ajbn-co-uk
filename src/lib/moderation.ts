// Local member-safety store: blocked members and abuse reports.
// Persisted in the browser so blocking works immediately, offline and in demo mode.

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

function emit() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ajbn-moderation-changed"));
  }
}

export function listBlocked(): string[] {
  return readList<string>(BLOCK_KEY);
}

export function isBlocked(userId?: string | null): boolean {
  if (!userId) return false;
  return listBlocked().includes(userId);
}

export function blockMember(userId: string) {
  const next = Array.from(new Set([...listBlocked(), userId]));
  write(BLOCK_KEY, next);
  emit();
}

export function unblockMember(userId: string) {
  write(BLOCK_KEY, listBlocked().filter((id) => id !== userId));
  emit();
}

export function listReports(): MemberReport[] {
  return readList<MemberReport>(REPORT_KEY);
}

export function reportMember(input: Omit<MemberReport, "id" | "created_at">): MemberReport {
  const report: MemberReport = {
    ...input,
    id: `rep-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`,
    created_at: new Date().toISOString(),
  };
  write(REPORT_KEY, [report, ...listReports()].slice(0, 200));
  emit();
  return report;
}
