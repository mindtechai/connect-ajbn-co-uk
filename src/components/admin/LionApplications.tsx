import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Crown, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Row = {
  id: string; user_id: string; motivation: string; status: string; created_at: string;
  profiles?: { first_name: string | null; last_name: string | null; email: string | null; company: string | null } | null;
};

export function LionApplications() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lion_applications")
      .select("id, user_id, motivation, status, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    const list = (data ?? []) as Row[];
    const ids = list.map((r) => r.user_id);
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, first_name, last_name, email, company").in("id", ids);
      const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
      list.forEach((r) => (r.profiles = map.get(r.user_id) as any));
    }
    setRows(list);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const review = async (r: Row, approve: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("lion_applications").update({
      status: approve ? "approved" : "rejected",
      reviewed_by: user?.id, reviewed_at: new Date().toISOString(),
      review_notes: notes[r.id] || null,
    }).eq("id", r.id);
    if (approve) {
      await supabase.from("user_roles").insert({ user_id: r.user_id, role: "impact_lion" });
    }
    if (user) {
      await supabase.from("admin_audit_log").insert({
        actor_id: user.id, action: approve ? "approve_lion_application" : "reject_lion_application",
        target_type: "user", target_id: r.user_id,
        details: { email: r.profiles?.email },
      });
    }
    toast({ title: approve ? "Lion approved" : "Application rejected" });
    load();
  };

  if (loading) return <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><Crown className="text-gold" /> Lion Applications</h1>
        <p className="text-sm text-muted-foreground">{rows.length} pending</p>
      </div>
      {rows.length === 0 && (
        <div className="bg-card border rounded-xl p-8 text-center text-sm text-muted-foreground">No pending applications.</div>
      )}
      {rows.map((r) => (
        <div key={r.id} className="bg-card border rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-sm">{r.profiles?.first_name} {r.profiles?.last_name}</p>
              <p className="text-xs text-muted-foreground">{r.profiles?.company} · {r.profiles?.email}</p>
            </div>
            <Badge variant="secondary">{new Date(r.created_at).toLocaleDateString("en-GB")}</Badge>
          </div>
          <p className="text-sm bg-muted rounded-md p-3 whitespace-pre-wrap">{r.motivation}</p>
          <Textarea
            placeholder="Optional reviewer notes…"
            rows={2}
            value={notes[r.id] ?? ""}
            onChange={(e) => setNotes((p) => ({ ...p, [r.id]: e.target.value }))}
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => review(r, false)}><X size={14} /> Reject</Button>
            <Button size="sm" onClick={() => review(r, true)}><Check size={14} /> Approve as Lion</Button>
          </div>
        </div>
      ))}
    </div>
  );
}