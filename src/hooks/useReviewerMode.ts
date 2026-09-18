import { useAuth } from "@/hooks/useAuth";

export const REVIEWER_EMAIL = "apple-review@ajbn.co.uk";

export const REVIEWER_BANNER =
  "Reviewer mode — moderation tools visible, contact details hidden for privacy.";

/**
 * True when the signed-in account is the App Store review account.
 * Reviewer mode hides member contact details and 1-2-1 / messaging actions,
 * leaving only moderation tools (Block / Report).
 */
export function useReviewerMode(): boolean {
  const { user } = useAuth();
  return (user?.email ?? "").toLowerCase() === REVIEWER_EMAIL;
}
