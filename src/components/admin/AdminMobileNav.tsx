import { Link, useLocation } from "@/lib/router-compat";
import { BarChart3, UserCheck, Users, Flag, Ban } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminScope } from "@/components/RequireSuperAdmin";

interface Props {
  pendingCount?: number;
  reportCount?: number;
  blockCount?: number;
}

const fullNavItems = [
  { label: "Overview", icon: BarChart3, path: "/admin" },
  { label: "Members", icon: Users, path: "/admin/members" },
  { label: "Approvals", icon: UserCheck, path: "/admin/approvals" },
  { label: "Reports", icon: Flag, path: "/admin/reports" },
  { label: "Blocks", icon: Ban, path: "/admin/blocks" },
];

const moderationNavItems = [
  { label: "Overview", icon: BarChart3, path: "/admin" },
  { label: "Members", icon: Users, path: "/admin/members" },
  { label: "Approvals", icon: UserCheck, path: "/admin/approvals" },
  { label: "Reports", icon: Flag, path: "/admin/reports" },
  { label: "Blocks", icon: Ban, path: "/admin/blocks" },
];

export function AdminMobileNav({ pendingCount = 0, reportCount = 0, blockCount = 0 }: Props) {
  const location = useLocation();
  const scope = useAdminScope();
  const navItems = scope === "moderation" ? moderationNavItems : fullNavItems;

  const badgeFor = (path: string) => {
    if (path === "/admin/reports") return reportCount;
    if (path === "/admin/blocks") return blockCount;
    if (path === "/admin/approvals") return pendingCount;
    return 0;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50 safe-area-pb">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const active =
            item.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.path);
          const badge = badgeFor(item.path);
          const showBadge = badge > 0;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "relative flex flex-col items-center gap-0.5 px-2 py-1 text-xs transition-colors",
                active ? "text-primary font-medium" : "text-muted-foreground"
              )}
            >
              <span className="relative">
                <item.icon size={18} />
                {showBadge && (
                  <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
