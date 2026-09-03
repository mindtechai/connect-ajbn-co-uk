import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Loader2, Flag, CheckCircle2 } from "lucide-react";

type Row = {
  id: string;
  reporter_id: string;
  target_id: string | null;
  target_name: string | null;
  reason: string;
  details: string | null;
  context: string;
  status: string;
  created_at: string;
};

type Person = { first_name: string | null; last_name: string | null; email: string | null };

const statusStyles: Record<string, string> = {
  open: "bg-destructive/15 text-destructive",
  reviewed: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  resolved: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
};

export function MemberReportsAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [people, setPeople] = useState<Record<string, Person>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("member_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Could not load reports", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    const list = (data ?? []) as Row[];
    setRows(list);

    const ids = Array.from(
      new Set(list.flatMap((r) => [r.reporter_id, r.target_id].filter(Boolean) as string[])),
    );
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", ids);
      const map: Record<string, Person> = {};
      (profs ?? []).forEach((p: any) => {
        map[p.id] = { first_name: p.first_name, last_name: p.last_name, email: p.email };
      });
      setPeople(map);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("member_reports").update({ status }).eq("id", id);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    toast({ title: `Report marked ${status}` });
  };

  const nameOf = (id: string | null, fallback: string | null) => {
    if (!id) return fallback || "Unknown member";
    const p = people[id];
    return [p?.first_name, p?.last_name].filter(Boolean).join(" ") || fallback || "Member";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Flag size={18} className="text-destructive" />
        <h2 className="text-lg font-display font-bold">Member Reports</h2>
        <Badge variant="outline" className="ml-2">
          {rows.filter((r) => r.status === "open").length} open
        </Badge>
      </div>

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
                    {nameOf(r.reporter_id, null)} reported {nameOf(r.target_id, r.target_name)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.reason} · from {r.context === "chat" ? "chat" : "directory"} ·{" "}
                    {new Date(r.created_at).toLocaleString("en-GB")}
                  </p>
                  {r.details ? <p className="text-sm mt-2 whitespace-pre-wrap">{r.details}</p> : null}
                  {people[r.reporter_id]?.email ? (
                    <p className="text-[11px] text-muted-foreground mt-2">
                      Reporter: {people[r.reporter_id]?.email}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[11px] px-2 py-1 rounded-full ${statusStyles[r.status] ?? "bg-muted"}`}>
                    {r.status}
                  </span>
                  {r.status !== "reviewed" && r.status !== "resolved" && (
                    <Button size="sm" variant="outline" onClick={() => void setStatus(r.id, "reviewed")}>
                      Mark reviewed
                    </Button>
                  )}
                  {r.status !== "resolved" && (
                    <Button size="sm" onClick={() => void setStatus(r.id, "resolved")} className="gap-1.5">
                      <CheckCircle2 size={14} /> Resolve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
