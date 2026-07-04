import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";

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
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showSolid ? "bg-card shadow-sm" : "bg-transparent"}`}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={ajbnLogo.url}
            alt="Asian Jewish Business Network"
            className="h-9 w-9 rounded-md object-cover shadow-sm"
          />
          <span className={`font-display text-lg font-bold tracking-tight transition-colors hidden sm:inline ${showSolid ? "text-primary" : "text-primary-foreground"}`}>
            AJBN
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {["About", "Events", "Impact Lions"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className={`text-sm font-medium transition-colors hover:opacity-80 ${showSolid ? "text-muted-foreground hover:text-foreground" : "text-primary-foreground/80 hover:text-primary-foreground"}`}
            >
              {item}
            </a>
          ))}
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
          className={`md:hidden ${showSolid ? "text-foreground" : "text-primary-foreground"}`}
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-card border-t shadow-lg p-4 flex flex-col gap-3">
          {["About", "Events", "Impact Lions"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground py-2"
              onClick={() => setOpen(false)}
            >
              {item}
            </a>
          ))}
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
