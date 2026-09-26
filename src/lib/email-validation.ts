// Shared email validation.
// Apple "Hide My Email" addresses use @privaterelay.appleid.com or
// @private.icloud.com and must ALWAYS be accepted — never treat them as
// invalid or disposable. Any future disposable-domain check must whitelist
// these domains first (see src/lib/apple-relay.ts).
import { isAppleRelayEmail } from "@/lib/apple-relay";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmailAddress(email: string): boolean {
  const trimmed = email.trim();
  if (isAppleRelayEmail(trimmed)) return true; // Apple relay domains always allowed
  return EMAIL_RE.test(trimmed);
}
