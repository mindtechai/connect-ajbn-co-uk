import { Link, useLocation } from "react-router-dom";
import { BarChart3, UserCheck, Zap, CalendarDays, HeartHandshake } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", icon: BarChart3, path: "/admin" },
  { label: "Approvals", icon: UserCheck, path: "/admin/approvals" },
  { label: "Events", icon: CalendarDays, path: "/admin/events" },
  { label: "ESG", icon: HeartHandshake, path: "/admin/esg" },
  { label: "Bulk", icon: Zap, path: "/admin/bulk-actions" },
];

export function AdminMobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50 safe-area-pb">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const active =
            item.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors",
                active ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
