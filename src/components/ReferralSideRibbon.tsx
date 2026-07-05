import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Gift } from "lucide-react";

/**
 * Fixed vertical ribbon on the top-right edge of every page,
 * linking to the Membership Referral Rewards page.
 */
export function ReferralSideRibbon() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [homeVisible, setHomeVisible] = useState(false);

  // On the homepage, only show the ribbon while the About or Events
  // sections are on screen. On other pages, show it always.
  useEffect(() => {
    if (!isHome) return;
    const ids = ["about", "events"];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        });
        setHomeVisible(visible.size > 0);
      },
      {
        // Only count a section as "in view" when it crosses the viewport's
        // middle band, so the ribbon truly hides between sections.
        rootMargin: "-35% 0px -35% 0px",
        threshold: 0,
      }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [isHome, pathname]);

  // Always hide on the target page and inside the admin console.
  if (pathname.startsWith("/referral-rewards") || pathname.startsWith("/admin")) {
    return null;
  }
  // On the homepage, only render when About/Events sections are in view.
  if (isHome && !homeVisible) return null;

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