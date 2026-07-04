import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Row = { id: string; actor_id: string; action: string; target_type: string | null; target_id: string | null; details: any; created_at: string; actor?: { first_name: string | null; last_name: string | null; email: string | null } };

export function AuditLog() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("admin_audit_log")
        .select("id, actor_id, action, target_type, target_id, details, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      const list = (data ?? []) as Row[];
      const ids = Array.from(new Set(list.map((r) => r.actor_id)));
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, first_name, last_name, email").in("id", ids);
        const map = new Map((profs ?? []).map((p: any) => [p.id, p]));
        list.forEach((r) => (r.actor = map.get(r.actor_id) as any));
      }
      setRows(list);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-display font-bold flex items-center gap-2"><ScrollText /> Audit log</h1>
        <p className="text-sm text-muted-foreground">Latest {rows.length} admin actions</p>
      </div>
      <div className="bg-card border rounded-xl divide-y">
        {rows.map((r) => (
          <div key={r.id} className="p-3 flex items-center justify-between gap-3 text-sm">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{r.action}</Badge>
                <span className="text-muted-foreground truncate">
                  {r.details?.name || r.details?.email || r.target_id || ""}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                by {r.actor?.first_name ?? ""} {r.actor?.last_name ?? ""} ({r.actor?.email})
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{new Date(r.created_at).toLocaleString("en-GB")}</span>
          </div>
        ))}
        {rows.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No admin activity yet.</p>}
      </div>
    </div>
  );
}