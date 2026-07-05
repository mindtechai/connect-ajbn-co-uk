import { Link, useLocation } from "react-router-dom";
import { Gift } from "lucide-react";

/**
 * Fixed vertical ribbon on the top-right edge of every page,
 * linking to the Membership Referral Rewards page.
 */
export function ReferralSideRibbon() {
  const { pathname } = useLocation();
  // Hide on the homepage (already has a built-in vertical label),
  // on the page it points to, and inside the admin console.
  if (
    pathname === "/" ||
    pathname.startsWith("/referral-rewards") ||
    pathname.startsWith("/admin")
  )
    return null;

  return (
    <Link
      to="/referral-rewards"
      aria-label="Membership Referral Rewards"
      className="hidden md:flex fixed top-24 right-0 z-40 items-center gap-2 rounded-l-lg bg-gold text-primary px-3 py-4 shadow-lg hover:bg-gold/90 transition-colors [writing-mode:vertical-rl] font-semibold text-xs tracking-[0.25em] uppercase"
    >
      <Gift size={14} className="-rotate-90" />
      Membership Referral Rewards
    </Link>
  );
}