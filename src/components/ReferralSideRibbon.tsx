import { useEffect, useState } from "react";
import { Link, useLocation } from "@/lib/router-compat";
import { Gift, X } from "lucide-react";

const DISMISSED_KEY = "referralRibbonDismissed";
const DISMISSED_AT_KEY = "referralRibbonDismissedAt";
const DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Fixed vertical ribbon on the top-right edge of every page,
 * linking to the Membership Referral Rewards page.
 */
export function ReferralSideRibbon() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const [homeVisible, setHomeVisible] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const wasDismissed = localStorage.getItem(DISMISSED_KEY) === "true";
      const dismissedAt = Number(localStorage.getItem(DISMISSED_AT_KEY));
      const isRecent = Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISS_TTL_MS;

      if (wasDismissed && isRecent) {
        setDismissed(true);
        return;
      }

      localStorage.removeItem(DISMISSED_KEY);
      localStorage.removeItem(DISMISSED_AT_KEY);
    } catch {
      // Private browsing may restrict storage; the ribbon can still be used.
    }
    setDismissed(false);
  }, []);

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
  if (dismissed || pathname.startsWith("/referral-rewards") || pathname.startsWith("/admin")) {
    return null;
  }
  // On the homepage, only render when About/Events sections are in view.
  if (isHome && !homeVisible) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
      localStorage.setItem(DISMISSED_AT_KEY, Date.now().toString());
    } catch {
      // Hide for this visit even when storage is unavailable.
    }
    setDismissed(true);
  };

  return (
    <div className="referral-side-ribbon fixed right-0 z-40 flex items-center rounded-l-lg bg-gold text-primary shadow-lg top-28 md:top-24">
      <Link
        to="/referral-rewards"
        aria-label="Membership Referral Rewards"
        className="flex items-center gap-1.5 px-1.5 py-2 font-semibold uppercase transition-colors hover:bg-gold/90 [writing-mode:vertical-rl] md:px-3 md:py-4 text-[10px] md:text-xs tracking-[0.15em] md:tracking-[0.25em]"
      >
        <Gift className="-rotate-90 h-3 w-3 md:h-3.5 md:w-3.5" />
        Membership Referral Rewards
      </Link>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss Membership Referral Rewards"
        className="hidden min-h-11 min-w-11 items-center justify-center border-l border-primary/20 text-primary hover:bg-gold/90 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary md:hidden"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}