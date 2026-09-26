// Friendly name for greetings. Never falls back to IDs, codes or email prefixes.
type P = { first_name?: string | null; last_name?: string | null } | null | undefined;
type U = { user_metadata?: Record<string, unknown> } | null | undefined;

export function displayFirstName(profile: P, user: U): string {
  const meta = user?.user_metadata ?? {};
  const pick = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : "");
  const first =
    pick(profile?.first_name) ||
    pick(meta["first_name"]) ||
    pick(meta["given_name"]) ||
    pick(meta["full_name"]).split(" ")[0] ||
    pick(meta["name"]).split(" ")[0];
  return first || "Member";
}
