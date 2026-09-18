/**
 * AI Business Needs Matcher feature flag.
 *
 * The matcher is a Build 9 feature. It stays hidden for the store-review
 * account so the Build 8 submission under review is unaffected.
 */
export const AI_MATCHER_HIDDEN_EMAILS = ["apple-review@ajbn.co.uk"];

export function aiMatcherEnabledFor(email: string | null | undefined): boolean {
  if (!email) return false;
  return !AI_MATCHER_HIDDEN_EMAILS.includes(email.trim().toLowerCase());
}
