import { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams, Link } from "@/lib/router-compat";
import { LogOut, Settings, Shield, ShieldCheck, Bell, AlertTriangle } from "lucide-react";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";
import { assetUrl } from "@/lib/asset";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { AnalyticsOverview } from "@/components/admin/AnalyticsOverview";
import { MemberApprovals } from "@/components/admin/MemberApprovals";
import { MemberManagement } from "@/components/admin/MemberManagement";
import { MemberDetail } from "@/components/admin/MemberDetail";
import { BlocksAdmin } from "@/components/admin/BlocksAdmin";
import { BulkActionsPanel } from "@/components/admin/BulkActionsPanel";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { EventsManagement } from "@/components/admin/EventsManagement";
import { ESGManagement } from "@/components/admin/ESGManagement";
import { LionApplications } from "@/components/admin/LionApplications";
import { AuditLog } from "@/components/admin/AuditLog";
import { EventCheckIn } from "@/components/admin/EventCheckIn";
import { IntroRequestsAdmin } from "@/components/admin/IntroRequestsAdmin";
import { EnquiriesAdmin } from "@/components/admin/EnquiriesAdmin";
import { MemberReportsAdmin } from "@/components/admin/MemberReportsAdmin";
import { useAuth } from "@/hooks/useAuth";
import { NotificationsBell } from "@/components/NotificationsBell";
import { useAdminScope } from "@/components/RequireSuperAdmin";
import { supabase } from "@/integrations/supabase/client";

export default function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<{ memberId?: string }>();
  const { signOut } = useAuth();
  const scope = useAdminScope();
  const [pendingCount, setPendingCount] = useState(0);
  const [reportCount, setReportCount] = useState(0);
  const [blockCount, setBlockCount] = useState(0);

  const loadPendingCount = async () => {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_approved", false)
      .is("deleted_at", null);
    setPendingCount(count ?? 0);
  };

  // Moderation counters (Apple guideline 1.2): open reports and active blocks.
  const loadModerationCounts = async () => {
    const [reports, blocks] = await Promise.all([
      supabase.from("member_reports").select("id", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("member_blocks").select("id", { count: "exact", head: true }),
    ]);
    setReportCount(reports.count ?? 0);
    setBlockCount(blocks.count ?? 0);
  };

  useEffect(() => {
    loadPendingCount();
    void loadModerationCounts();
    const ch = supabase
      .channel("admin-pending-count")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
        void loadPendingCount();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "member_reports" }, () => {
        void loadModerationCounts();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "member_blocks" }, () => {
        void loadModerationCounts();
      })
      .subscribe();

    // Polling + focus refresh keeps counters live even where change streaming
    // is unavailable for a table.
    const refresh = () => { void loadPendingCount(); void loadModerationCounts(); };
    const timer = window.setInterval(refresh, 30_000);
    window.addEventListener("focus", refresh);

    return () => {
      supabase.removeChannel(ch);
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  const getContent = () => {
    if (location.pathname.startsWith("/admin/members/") && params.memberId) {
      return <MemberDetail memberId={params.memberId} />;
    }
    if (location.pathname === "/admin/members") return <MemberManagement />;
    if (location.pathname === "/admin/approvals") return <MemberApprovals pendingCount={pendingCount} />;
    if (location.pathname === "/admin/blocks") return <BlocksAdmin />;
    if (location.pathname === "/admin/communications") return <BulkActionsPanel />;
    if (location.pathname === "/admin/bulk-actions") return <BulkActionsPanel />;
    if (location.pathname === "/admin/events") return <EventsManagement />;
    if (location.pathname === "/admin/checkin") return <EventCheckIn />;
    if (location.pathname === "/admin/esg") return <ESGManagement />;
    if (location.pathname === "/admin/lions") return <LionApplications />;
    if (location.pathname === "/admin/intros") return <IntroRequestsAdmin />;
    if (location.pathname === "/admin/enquiries") return <EnquiriesAdmin />;
    if (location.pathname === "/admin/reports") return <MemberReportsAdmin />;
    if (location.pathname === "/admin/audit") return <AuditLog />;
    if (location.pathname === "/admin/settings") return <AdminSettings />;
    return <AnalyticsOverview pendingCount={pendingCount} />;
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar pendingCount={pendingCount} reportCount={reportCount} blockCount={blockCount} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-card border-b sticky top-0 z-40">
          <div className="px-4 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src={assetUrl(ajbnLogo)} alt="AJBN" className="h-8 w-8 rounded-md object-cover" />
              {scope === "moderation" ? (
                <>
                  <ShieldCheck size={14} className="text-amber-500" />
                  <span className="font-display text-sm font-bold text-foreground">AJBN Reviewer</span>
                </>
              ) : (
                <>
                  <Shield size={14} className="text-primary" />
                  <span className="font-display text-sm font-bold text-primary">AJBN Admin</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/admin/members?filter=pending"
                className="relative text-muted-foreground hover:text-foreground"
                aria-label="Pending approvals"
              >
                <Bell size={18} />
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                )}
              </Link>
              <NotificationsBell />
              {scope === "full" && (
                <Link to="/settings" className="text-muted-foreground hover:text-foreground" aria-label="Account settings" title="Account settings">
                  <Settings size={18} />
                </Link>
              )}
              <button
                onClick={async () => { await signOut(); navigate("/login"); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        {scope === "moderation" && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 lg:px-8 py-2 flex items-center gap-2 text-amber-800 dark:text-amber-300 text-sm">
            <AlertTriangle size={16} />
            <span>Reviewer mode — moderation tools visible, contact details hidden for privacy.</span>
          </div>
        )}

        <main className="flex-1 p-4 lg:p-8 pb-20 md:pb-8 overflow-auto">
          {getContent()}
        </main>
      </div>

      <AdminMobileNav pendingCount={pendingCount} reportCount={reportCount} blockCount={blockCount} />
    </div>
  );
}
