import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2 } from "lucide-react";

type Status = "pending" | "in_review" | "accepted" | "declined" | "completed" | "cancelled";

type Row = {
  id: string;
  requester_id: string;
  target_name: string;
  target_company: string | null;
  target_email: string | null;
  reason: string;
  status: Status;
  admin_notes: string | null;
  outcome_notes: string | null;
  completed_at: string | null;
  created_at: string;
};

type Requester = { first_name: string | null; last_name: string | null; email: string | null };

const statusStyles: Record<Row["status"], string> = {
  pending: "bg-muted text-foreground",
  in_review: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  accepted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  completed: "bg-gold/20 text-gold",
  declined: "bg-destructive/15 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

export function IntroRequestsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [requesters, setRequesters] = useState<Record<string, Requester>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("member_intro_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    const list = (data ?? []) as Row[];
    setRows(list);
    const ids = Array.from(new Set(list.map((r) => r.requester_id)));
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", ids);
      const map: Record<string, Requester> = {};
      (profs ?? []).forEach((p: any) => {
        map[p.id] = { first_name: p.first_name, last_name: p.last_name, email: p.email };
      });
      setRequesters(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: Status, patch: Record<string, unknown> = {}) => {
    const { error } = await supabase
      .from("member_intro_requests")
      .update({ status, ...patch })
      .eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    load();
  };

  return (
    <div className="p-4 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Intro Requests</h1>
        <p className="text-sm text-muted-foreground">
          Member-to-member introduction requests. Move status forward and record outcomes.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading…
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No intro requests yet.</p>
      ) : (
        <div className="grid gap-4">
          {rows.map((r) => (
            <IntroRow key={r.id} row={r} requester={requesters[r.requester_id]} onStatus={setStatus} />
          ))}
        </div>
      )}
    </div>
  );
}

function IntroRow({
  row,
  requester,
  onStatus,
}: {
  row: Row;
  requester?: Requester;
  onStatus: (id: string, status: Status, patch?: Record<string, unknown>) => Promise<void>;
}) {
  const [openComplete, setOpenComplete] = useState(false);
  const [outcome, setOutcome] = useState(row.outcome_notes ?? "");
  const [saving, setSaving] = useState(false);

  const requesterName = requester
    ? `${requester.first_name ?? ""} ${requester.last_name ?? ""}`.trim() || requester.email
    : row.requester_id.slice(0, 8);

  const complete = async () => {
    setSaving(true);
    await onStatus(row.id, "completed", {
      outcome_notes: outcome.trim() || null,
      completed_at: new Date().toISOString(),
    });
    setSaving(false);
    setOpenComplete(false);
  };

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold">{row.target_name}</h3>
            {row.target_company && (
              <span className="text-xs text-muted-foreground">· {row.target_company}</span>
            )}
            <Badge className={statusStyles[row.status]} variant="secondary">
              {row.status}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Requested by <span className="font-medium">{requesterName}</span> ·{" "}
            {new Date(row.created_at).toLocaleString()}
          </p>
          {row.target_email && (
            <p className="text-xs text-muted-foreground">Target email: {row.target_email}</p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {row.status !== "in_review" && row.status !== "completed" && row.status !== "cancelled" && (
            <Button size="sm" variant="outline" onClick={() => onStatus(row.id, "in_review")}>
              Mark in review
            </Button>
          )}
          {row.status !== "accepted" && row.status !== "completed" && (
            <Button size="sm" variant="outline" onClick={() => onStatus(row.id, "accepted")}>
              Accept
            </Button>
          )}
          {row.status !== "declined" && row.status !== "completed" && (
            <Button size="sm" variant="outline" onClick={() => onStatus(row.id, "declined")}>
              Decline
            </Button>
          )}
          <Dialog open={openComplete} onOpenChange={setOpenComplete}>
            <DialogTrigger asChild>
              <Button size="sm">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {row.status === "completed" ? "Edit outcome" : "Mark completed"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mark introduction as completed</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                <Label htmlFor={`outcome-${row.id}`}>Outcome notes</Label>
                <Textarea
                  id={`outcome-${row.id}`}
                  rows={4}
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  placeholder="What was the outcome of the introduction?"
                  maxLength={2000}
                />
                <p className="text-xs text-muted-foreground">
                  A completion timestamp will be recorded automatically.
                </p>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenComplete(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={complete} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <p className="mt-3 text-sm">{row.reason}</p>

      {row.completed_at && (
        <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
          <p className="text-xs font-semibold text-muted-foreground">
            Completed {new Date(row.completed_at).toLocaleString()}
          </p>
          {row.outcome_notes && <p className="mt-1">{row.outcome_notes}</p>}
        </div>
      )}
    </div>
  );
}