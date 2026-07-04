import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HeartHandshake, Plus, Loader2, HandCoins, Clock, Trophy, CalendarCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type Contribution = {
  id: string;
  user_id: string;
  kind: string;
  amount: number;
  hours: number | null;
  notes: string | null;
  occurred_at: string;
};

type Profile = { id: string; first_name: string | null; last_name: string | null; company: string | null };

const KINDS = ["donation","sponsorship","volunteer_hours","event_attendance","other"] as const;

export function ESGManagement() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Contribution[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    user_id: "", kind: "donation", amount: "", hours: "", notes: "",
    occurred_at: new Date().toISOString().slice(0,10),
  });

  const load = async () => {
    setLoading(true);
    const [{ data: contribs }, { data: profs }] = await Promise.all([
      supabase.from("esg_contributions").select("*").order("occurred_at", { ascending: false }).limit(200),
      supabase.from("profiles").select("id, first_name, last_name, company").order("last_name", { ascending: true }),
    ]);
    setRows((contribs ?? []) as Contribution[]);
    setProfiles((profs ?? []) as Profile[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const nameFor = (id: string) => {
    const p = profiles.find((x) => x.id === id);
    if (!p) return "—";
    return [p.first_name, p.last_name].filter(Boolean).join(" ") || p.company || "Member";
  };

  const create = async () => {
    if (!user || !form.user_id) { toast({ title: "Pick a member", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.from("esg_contributions").insert({
      user_id: form.user_id,
      kind: form.kind as any,
      amount: form.amount ? Number(form.amount) : 0,
      hours: form.hours ? Number(form.hours) : null,
      notes: form.notes || null,
      occurred_at: new Date(form.occurred_at).toISOString(),
      recorded_by: user.id,
    });
    setSaving(false);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Contribution recorded" });
    setOpen(false);
    setForm({ user_id: "", kind: "donation", amount: "", hours: "", notes: "", occurred_at: new Date().toISOString().slice(0,10) });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <HeartHandshake size={20} className="text-primary" /> ESG contributions
          </h1>
          <p className="text-sm text-muted-foreground">Record donations, sponsorships, volunteer hours and event attendance for members.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-1.5"><Plus size={14} /> Record contribution</Button>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : rows.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <p className="text-sm text-muted-foreground">Nothing recorded yet.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl shadow-sm divide-y">
          {rows.map((r) => {
            const Icon = r.kind === "donation" ? HandCoins :
                         r.kind === "sponsorship" ? HeartHandshake :
                         r.kind === "volunteer_hours" ? Clock :
                         r.kind === "event_attendance" ? CalendarCheck : Trophy;
            return (
              <div key={r.id} className="p-4 flex items-start gap-3">
                <div className="rounded-lg bg-muted w-9 h-9 grid place-items-center shrink-0"><Icon size={16} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{nameFor(r.user_id)}</p>
                    <Badge variant="outline" className="text-xs capitalize">{r.kind.replace("_"," ")}</Badge>
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
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Record ESG contribution</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Member</Label>
              <Select value={form.user_id} onValueChange={(v) => setForm({...form, user_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select member…" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {profiles.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{[p.first_name, p.last_name].filter(Boolean).join(" ") || "—"} {p.company ? `· ${p.company}` : ""}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Kind</Label>
                <Select value={form.kind} onValueChange={(v) => setForm({...form, kind: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {KINDS.map((k) => <SelectItem key={k} value={k} className="capitalize">{k.replace("_"," ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Date</Label><Input type="date" value={form.occurred_at} onChange={(e) => setForm({...form, occurred_at: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Amount (£)</Label><Input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} /></div>
              <div className="space-y-1.5"><Label>Hours</Label><Input type="number" value={form.hours} onChange={(e) => setForm({...form, hours: e.target.value})} /></div>
            </div>
            <div className="space-y-1.5"><Label>Notes</Label><Textarea rows={3} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} /></div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={create} disabled={saving}>{saving && <Loader2 size={14} className="animate-spin mr-1.5" />} Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}