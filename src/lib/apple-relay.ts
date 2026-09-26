// Apple June 2026 - accept both relay domains
// Hide My Email addresses may come from either domain. Never block either;
// this helper is only used for display ("Private Apple email").
export const APPLE_RELAY_DOMAINS = ["privaterelay.appleid.com", "private.icloud.com"] as const;

export function isAppleRelayEmail(email?: string | null): boolean {
  const domain = email?.split("@")[1]?.toLowerCase().trim();
  return !!domain && (APPLE_RELAY_DOMAINS as readonly string[]).includes(domain);
}
