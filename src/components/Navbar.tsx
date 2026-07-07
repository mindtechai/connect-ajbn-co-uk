import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";
import impactLionsLogo from "@/assets/impact-lions-logo.png.asset.json";
import { assetUrl } from "@/lib/asset";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showSolid = !isLanding || scrolled;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 pt-[env(safe-area-inset-top)] transition-all duration-300 ${showSolid ? "bg-card shadow-sm" : "bg-transparent"}`}>
      <div className="container mx-auto flex justify-between items-center h-20 px-4 lg:px-8">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 min-w-0"
            onClick={(e) => {
              if (location.pathname === "/") {
                e.preventDefault();
                window.history.replaceState(null, "", "/");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            <img
              src={assetUrl(ajbnLogo)}
              alt="Asian Jewish Business Network logo"
              className={`h-11 w-11 md:h-12 md:w-12 lg:h-14 lg:w-14 rounded-lg object-cover shadow-md ring-2 shrink-0 ${showSolid ? "ring-gold/60" : "ring-gold/80"}`}
            />
            <span className={`font-display font-bold tracking-tight transition-colors truncate ${showSolid ? "text-primary" : "text-primary-foreground"} text-sm sm:text-base lg:text-lg xl:text-xl hidden md:block`}>
              <span className="hidden sm:inline">Asian Jewish Business Network</span>
              <span className="sm:hidden">AJBN</span>
            </span>
          </Link>
          <Link to="/lions" aria-label="AJBN Impact Lions Club page">
            <img
              src={assetUrl(impactLionsLogo)}
              alt="AJBN Impact Lions Club logo"
              className="h-12 w-12 md:h-14 md:w-14 lg:h-16 lg:w-16 object-contain shrink-0 hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {[
            { label: "About", to: "/#about" },
            { label: "Events", to: "/#events" },
            { label: "Impact Lions", to: "/lions" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`text-sm font-medium transition-colors hover:opacity-80 ${showSolid ? "text-muted-foreground hover:text-foreground" : "text-primary-foreground/80 hover:text-primary-foreground"}`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/referral-rewards"
            className={`text-sm font-medium transition-colors hover:opacity-80 ${showSolid ? "text-muted-foreground hover:text-foreground" : "text-primary-foreground/80 hover:text-primary-foreground"}`}
          >
            Referral Rewards
          </Link>
          <a
            href="https://www.ajbn.co.uk/sponsors-partners/"
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm font-medium transition-colors hover:opacity-80 ${showSolid ? "text-muted-foreground hover:text-foreground" : "text-primary-foreground/80 hover:text-primary-foreground"}`}
          >
            Sponsors & Partners
          </a>
          <Link to="/login">
            <Button variant={showSolid ? "outline" : "heroOutline"} size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant={showSolid ? "default" : "hero"} size="sm">
              Join AJBN
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className={`md:hidden min-w-[44px] min-h-[44px] flex items-center justify-center ${showSolid ? "text-foreground" : "text-primary-foreground"}`}
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-card border-t shadow-lg p-4 flex flex-col gap-3">
          {[
            { label: "About", to: "/#about" },
            { label: "Events", to: "/#events" },
            { label: "Impact Lions", to: "/lions" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="text-sm font-medium text-muted-foreground hover:text-foreground py-2"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/referral-rewards"
            className="text-sm font-medium text-muted-foreground hover:text-foreground py-2"
            onClick={() => setOpen(false)}
          >
            Referral Rewards
          </Link>
          <a
            href="https://www.ajbn.co.uk/sponsors-partners/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-muted-foreground hover:text-foreground py-2"
            onClick={() => setOpen(false)}
          >
            Sponsors & Partners
          </a>
          <Link to="/login" onClick={() => setOpen(false)}>
            <Button variant="outline" size="sm" className="w-full">Sign In</Button>
          </Link>
          <Link to="/register" onClick={() => setOpen(false)}>
            <Button size="sm" className="w-full">Join AJBN</Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
