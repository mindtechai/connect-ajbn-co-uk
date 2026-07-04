import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Loader2, Trophy, HandCoins, HeartHandshake, Clock, CalendarCheck } from "lucide-react";

type Contribution = {
  id: string;
  kind: "donation" | "sponsorship" | "volunteer_hours" | "event_attendance" | "other";
  amount: number;
  currency: string;
  hours: number | null;
  notes: string | null;
  occurred_at: string;
  event_id: string | null;
};

const KIND_ICONS: Record<string, any> = {
  donation: HandCoins,
  sponsorship: HeartHandshake,
  volunteer_hours: Clock,
  event_attendance: CalendarCheck,
  other: Trophy,
};

const KIND_LABEL: Record<string, string> = {
  donation: "Donation",
  sponsorship: "Sponsorship",
  volunteer_hours: "Volunteer hours",
  event_attendance: "Event attendance",
  other: "Other",
};

export default function ESGReportPage() {
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<Contribution[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
    (async () => {
      const { data } = await supabase
        .from("esg_contributions")
        .select("*")
        .eq("user_id", user.id)
        .order("occurred_at", { ascending: false });
      setRows((data ?? []) as Contribution[]);
      setLoading(false);
    })();
  }, [user, authLoading]);

  const years = useMemo(() => {
    const s = new Set<number>();
    rows.forEach((r) => s.add(new Date(r.occurred_at).getFullYear()));
    if (s.size === 0) s.add(new Date().getFullYear());
    return Array.from(s).sort((a, b) => b - a);
  }, [rows]);

  const filtered = useMemo(() => rows.filter((r) => new Date(r.occurred_at).getFullYear() === year), [rows, year]);

  const totals = useMemo(() => {
    let donated = 0, sponsored = 0, hours = 0, events = 0;
    for (const r of filtered) {
      if (r.kind === "donation") donated += Number(r.amount ?? 0);
      else if (r.kind === "sponsorship") sponsored += Number(r.amount ?? 0);
      else if (r.kind === "volunteer_hours") hours += Number(r.hours ?? 0);
      else if (r.kind === "event_attendance") events += 1;
    }
    return { donated, sponsored, hours, events };
  }, [filtered]);

  const exportCSV = () => {
    const header = ["Date", "Kind", "Amount", "Currency", "Hours", "Notes"];
    const csv = [header, ...filtered.map((r) => [
      new Date(r.occurred_at).toISOString().slice(0,10),
      KIND_LABEL[r.kind] ?? r.kind,
      String(r.amount ?? 0),
      r.currency,
      String(r.hours ?? ""),
      (r.notes ?? "").replace(/\n/g, " "),
    ])].map((row) => row.map((c) => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `ajbn-esg-${year}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout maxWidth="4xl">

      <>
        <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold">ESG contributions</h1>
            <p className="text-sm text-muted-foreground mt-1">
              A summary of your and your company's social impact through AJBN and Impact Lions Club.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border overflow-hidden">
              {years.map((y) => (
                <button key={y} onClick={() => setYear(y)} className={`px-3 py-1 text-xs ${y === year ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}>
                  {y}
                </button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5"><Download size={14} /> CSV</Button>
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="grid sm:grid-cols-4 gap-3 mb-8">
              <StatCard label="Donations" value={`£${totals.donated.toLocaleString()}`} icon={HandCoins} tint="text-gold" />
              <StatCard label="Sponsorships" value={`£${totals.sponsored.toLocaleString()}`} icon={HeartHandshake} tint="text-primary" />
              <StatCard label="Volunteer hours" value={String(totals.hours)} icon={Clock} tint="text-teal" />
              <StatCard label="Events attended" value={String(totals.events)} icon={CalendarCheck} tint="text-primary" />
            </div>

            <div className="bg-card border rounded-xl shadow-sm divide-y">
              <div className="px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {filtered.length} contribution{filtered.length !== 1 && "s"} in {year}
              </div>
              {filtered.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No contributions recorded for {year} yet. Admins can record donations, sponsorships and volunteer hours on your behalf.
                </div>
              ) : filtered.map((r) => {
                const Icon = KIND_ICONS[r.kind] ?? Trophy;
                return (
                  <div key={r.id} className="px-5 py-4 flex items-start gap-3">
                    <div className="rounded-lg bg-muted w-9 h-9 grid place-items-center shrink-0"><Icon size={16} /></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">{KIND_LABEL[r.kind] ?? r.kind}</p>
                        {(r.kind === "donation" || r.kind === "sponsorship") && r.amount > 0 && (
                          <Badge variant="outline" className="text-xs">£{Number(r.amount).toLocaleString()}</Badge>
                        )}
                        {r.kind === "volunteer_hours" && r.hours && (
                          <Badge variant="outline" className="text-xs">{r.hours} hrs</Badge>
                        )}
                      </div>
                      {r.notes && <p className="text-xs text-muted-foreground mt-0.5">{r.notes}</p>}
                      <p className="text-[10px] text-muted-foreground/70 mt-1">{new Date(r.occurred_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </>
    </AppLayout>
  );
}

function StatCard({ label, value, icon: Icon, tint }: { label: string; value: string; icon: any; tint: string }) {
  return (
    <div className="bg-card border rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={14} className={tint} />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className="text-xl font-bold tabular-nums">{value}</p>
    </div>
  );
}