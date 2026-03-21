import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors ${isLanding ? "bg-transparent" : "bg-card shadow-sm"}`}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className={`font-display text-xl font-bold ${isLanding ? "text-primary-foreground" : "text-primary"}`}>
            AJBN
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {["About", "Events", "Impact Lions"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className={`text-sm font-medium transition-colors hover:opacity-80 ${isLanding ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {item}
            </a>
          ))}
          <Link to="/login">
            <Button variant={isLanding ? "heroOutline" : "outline"} size="sm">
              Sign In
            </Button>
          </Link>
          <Link to="/register">
            <Button variant={isLanding ? "hero" : "default"} size="sm">
              Join AJBN
            </Button>
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className={`md:hidden ${isLanding ? "text-primary-foreground" : "text-foreground"}`}
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
