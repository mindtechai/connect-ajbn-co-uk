import { useNavigate, useLocation } from "react-router-dom";
import { Bell, LogOut, Shield } from "lucide-react";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AnalyticsOverview } from "@/components/admin/AnalyticsOverview";
import { MemberApprovals } from "@/components/admin/MemberApprovals";
import { MemberManagement } from "@/components/admin/MemberManagement";
import { BulkCommunications } from "@/components/admin/BulkCommunications";
import { BulkActionsPanel } from "@/components/admin/BulkActionsPanel";

function AdminSettingsPlaceholder() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-display font-bold">Settings</h1>
      <p className="text-muted-foreground">Admin settings coming soon.</p>
    </div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const getContent = () => {
    if (location.pathname === "/admin/members") return <MemberManagement />;
    if (location.pathname === "/admin/approvals") return <MemberApprovals />;
    if (location.pathname === "/admin/communications") return <BulkCommunications />;
    if (location.pathname === "/admin/bulk-actions") return <BulkActionsPanel />;
    if (location.pathname === "/admin/settings") return <AdminSettingsPlaceholder />;
    return <AnalyticsOverview />;
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-card border-b sticky top-0 z-40">
          <div className="px-4 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={ajbnLogo.url} alt="AJBN" className="h-8 w-8 rounded-md object-cover" />
              <Shield size={14} className="text-primary" />
              <span className="font-display text-sm font-bold text-primary">AJBN Admin</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative text-muted-foreground hover:text-foreground">
                <Bell size={18} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 lg:p-8 pb-20 md:pb-8 overflow-auto">
          {getContent()}
        </main>
      </div>

      <AdminMobileNav />
    </div>
  );
}
