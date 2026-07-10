import { NavLink, useLocation } from "react-router-dom";
import { Home, BookUser, MessageCircle, Briefcase, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/directory", label: "Directory", icon: BookUser },
  { to: "/messages", label: "Messages", icon: MessageCircle },
  { to: "/services", label: "Services", icon: Briefcase },
  { to: "/settings/profile", label: "Profile", icon: User },
];

const HIDE_ON = [/^\/login/, /^\/register/, /^\/reset-password/, /^\/forgot-password/, /^\/admin/];

export function MobileTabBar() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  if (!user) return null;
  if (HIDE_ON.some((r) => r.test(pathname))) return null;
  return (
    <nav
      aria-label="Primary mobile"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.15)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-5">
        {TABS.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === "/dashboard"}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 min-h-[56px] text-[10px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={20} aria-hidden />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}