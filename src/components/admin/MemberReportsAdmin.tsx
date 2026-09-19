import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Flag, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Link } from "@/lib/router-compat";
import { useAdminScope } from "@/components/RequireSuperAdmin";
import {
  listMemberReports,
  removeReportedContent,
  setReportStatus,
  type AdminReportRow,
} from "@/lib/admin-reports.functions";

const statusStyles: Record<string, string> = {
  open: "bg-destructive/15 text-destructive",
  reviewed: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  resolved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  dismissed: "bg-muted text-muted-foreground",
};

export function MemberReportsAdmin() {
  const scope = useAdminScope();
  const isFull = scope === "full";
  const fetchReports = useServerFn(listMemberReports);
  const updateStatus = useServerFn(setReportStatus);
  const removeContent = useServerFn(removeReportedContent);

  const [rows, setRows] = useState<AdminReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await fetchReports());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load reports");
    } finally {
      setLoading(false);
    }
  }, [fetchReports]);

  useEffect(() => { void load(); }, [load]);

  const changeStatus = async (id: string, status: "reviewed" | "resolved" | "dismissed") => {
    setBusyId(id);
    try {
      await updateStatus({ data: { reportId: id, status } });
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      toast.success(`Report ${status}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const [confirmRemove, setConfirmRemove] = useState<AdminReportRow | null>(null);

  const remove = async (id: string) => {
    setBusyId(id);
    try {
      const res = await removeContent({ data: { reportId: id } });
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status: "resolved" } : r)));
      toast.success(`Removed ${res.removed} post${res.removed === 1 ? "" : "s"} from this member`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Removal failed");
    } finally {
      setBusyId(null);
      setConfirmRemove(null);
    }
  };

  const openCount = rows.filter((r) => r.status === "open").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Flag size={18} className="text-destructive" />
        <h2 className="text-lg font-display font-bold">Member Reports</h2>
        <Badge
          className={openCount > 0 ? "ml-2 bg-destructive text-destructive-foreground" : "ml-2"}
          variant={openCount > 0 ? "default" : "outline"}
        >
          {openCount} open
        </Badge>
      </div>

      {!isFull && (
        <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-2">
          Reviewer mode — moderation tools visible, contact details hidden for privacy.
        </p>
      )}

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="animate-spin text-muted-foreground" size={20} />
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center">
          No member reports have been submitted.
        </p>
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <div key={r.id} className="bg-card border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {r.reporter_name} reported{" "}
                    {r.target_id ? (
                      <Link to={`/admin/members/${r.target_id}`} className="hover:underline">
                        {r.target_name ?? "Member"}
                      </Link>
                    ) : (
                      r.target_name ?? "Unknown member"
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.reason} · from {r.context === "chat" ? "chat" : "directory"} ·{" "}
                    {new Date(r.created_at).toLocaleString("en-GB")}
                  </p>
                  {r.details ? <p className="text-sm mt-2 whitespace-pre-wrap">{r.details}</p> : null}
                  {r.reporter_email ? (
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Reporter: {r.reporter_email}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <span className={`text-[11px] px-2 py-1 rounded-full ${statusStyles[r.status] ?? "bg-muted"}`}>
                    {r.status}
                  </span>
                  {busyId === r.id && <Loader2 size={14} className="animate-spin text-muted-foreground" />}
                  {r.status !== "dismissed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5"
                      disabled={busyId === r.id}
                      onClick={() => void changeStatus(r.id, "dismissed")}
                    >
                      <XCircle size={14} /> Dismiss
                    </Button>
                  )}
                  {isFull && r.target_id && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="gap-1.5"
                      disabled={busyId === r.id}
                      onClick={() => setConfirmRemove(r)}
                    >
                      <Trash2 size={14} /> Remove content
                    </Button>
                  )}
                  {r.status !== "resolved" && (
                    <Button
                      size="sm"
                      className="gap-1.5"
                      disabled={busyId === r.id}
                      onClick={() => void changeStatus(r.id, "resolved")}
                    >
                      <CheckCircle2 size={14} /> Resolve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={confirmRemove !== null} onOpenChange={(open) => !open && setConfirmRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this member's content?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete every live Needs &amp; Offers post by{" "}
              <strong>{confirmRemove?.target_name ?? "this member"}</strong> and mark the report
              as resolved. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busyId !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={busyId !== null}
              onClick={() => confirmRemove && void remove(confirmRemove.id)}
            >
              {busyId === confirmRemove?.id ? "Removing…" : "Yes, remove all their posts"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
