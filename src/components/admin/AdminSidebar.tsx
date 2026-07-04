import { Link, useLocation } from "react-router-dom";
import {
  Users, BarChart3, Mail, Shield, ChevronLeft,
  UserCheck, Settings, Home, Zap, CalendarDays, HeartHandshake, Crown, QrCode, ScrollText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { label: "Overview", icon: BarChart3, path: "/admin" },
  { label: "Members", icon: Users, path: "/admin/members" },
  { label: "Approvals", icon: UserCheck, path: "/admin/approvals" },
  { label: "Lion Applications", icon: Crown, path: "/admin/lions" },
  { label: "Events", icon: CalendarDays, path: "/admin/events" },
  { label: "Check-in", icon: QrCode, path: "/admin/checkin" },
  { label: "ESG", icon: HeartHandshake, path: "/admin/esg" },
  { label: "Communications", icon: Mail, path: "/admin/communications" },
  { label: "Bulk Actions", icon: Zap, path: "/admin/bulk-actions" },
  { label: "Audit Log", icon: ScrollText, path: "/admin/audit" },
  { label: "Settings", icon: Settings, path: "/admin/settings" },
];

export function AdminSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-navy text-primary-foreground border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-56"
      )}
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <span className="font-display text-lg font-bold">Admin</span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-primary-foreground/60 hover:text-primary-foreground"
        >
          <ChevronLeft
            size={18}
            className={cn("transition-transform", collapsed && "rotate-180")}
          />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3 space-y-1 px-2">
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
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-primary-foreground/70 hover:bg-sidebar-accent/50 hover:text-primary-foreground"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Back to dashboard */}
      <div className="p-2 border-t border-sidebar-border">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-primary-foreground/60 hover:text-primary-foreground hover:bg-sidebar-accent/50 transition-colors"
        >
          <Home size={18} className="shrink-0" />
          {!collapsed && <span>Back to Dashboard</span>}
        </Link>
      </div>
    </aside>
  );
}
