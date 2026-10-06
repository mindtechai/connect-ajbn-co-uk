// Sign in with Apple helpers (App Store Guideline 4.0 / 4.8): Apple already
// supplies name + email, so the app must never ask for them again.
import type { User } from "@supabase/supabase-js";

type UserLike = Pick<User, "app_metadata" | "user_metadata" | "email"> | null | undefined;

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export function isAppleUser(user: UserLike): boolean {
  const app = (user?.app_metadata ?? {}) as Record<string, unknown>;
  if (app["provider"] === "apple") return true;
  const providers = app["providers"];
  if (Array.isArray(providers) && providers.includes("apple")) return true;
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  if (meta["iss"] === "https://appleid.apple.com") return true;
  const identities = (user as { identities?: { provider?: string }[] } | null | undefined)?.identities;
  if (Array.isArray(identities) && identities.some((i) => i?.provider === "apple")) return true;
  return /@privaterelay\.appleid\.com$/i.test(user?.email ?? "");
}

/** Full name Apple provided (Apple only sends it on the very first sign-in). */
export function appleFullName(user: UserLike): string {
  const m = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const direct = str(m["full_name"]) || str(m["name"]) || str(m["fullName"]);
  if (direct) return direct;
  return [str(m["given_name"]) || str(m["first_name"]), str(m["family_name"]) || str(m["last_name"])]
    .filter(Boolean)
    .join(" ");
}

export function splitName(full: string): { first: string; last: string } {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { first: "", last: "" };
  return { first: parts[0] ?? "", last: parts.slice(1).join(" ") };
}
