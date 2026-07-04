import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, MapPin, Plus, Trash2, Users, Loader2, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  location: string | null;
  kind: string;
  capacity: number | null;
  fundraising_target: number | null;
  fundraising_raised: number;
  segments: string[];
};

const KINDS = ["networking","fundraising","flagship","roundtable","other"] as const;

export function EventsManagement() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", starts_at: "", location: "",
    kind: "networking", capacity: "", fundraising_target: "",
  });

  const load = async () => {
    setLoading(true);
    const [{ data: ev }, { data: allRsvps }] = await Promise.all([
      supabase.from("events").select("*").order("starts_at", { ascending: false }),
      supabase.from("event_rsvps").select("event_id, status, guests"),
    ]);
    setEvents((ev ?? []) as EventRow[]);
    const counts: Record<string, number> = {};
    for (const r of (allRsvps ?? []) as any[]) {
      if (r.status === "going") counts[r.event_id] = (counts[r.event_id] ?? 0) + 1 + (r.guests ?? 0);
    }
    setRsvpCounts(counts);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!user || !form.title || !form.starts_at) {
      toast({ title: "Missing fields", description: "Title and start date required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("events").insert({
      title: form.title,
      description: form.description || null,
      starts_at: new Date(form.starts_at).toISOString(),
      location: form.location || null,
      kind: form.kind as any,
      capacity: form.capacity ? Number(form.capacity) : null,
      fundraising_target: form.fundraising_target ? Number(form.fundraising_target) : null,
      created_by: user.id,
    });
    setSaving(false);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Event created" });
    setOpen(false);
    setForm({ title: "", description: "", starts_at: "", location: "", kind: "networking", capacity: "", fundraising_target: "" });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this event and all RSVPs?")) return;
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Event deleted" });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <CalendarDays size={20} /> Events
          </h1>
          <p className="text-sm text-muted-foreground">Create networking, fundraising, flagship and roundtable events.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gap-1.5"><Plus size={14} /> New event</Button>
      </div>

      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : events.length === 0 ? (
        <div className="bg-card border rounded-xl p-12 text-center">
          <p className="text-sm text-muted-foreground">No events yet. Create the first one.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {events.map((e) => (
            <div key={e.id} className="bg-card border rounded-xl p-5 shadow-sm space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="outline" className="text-xs capitalize">{e.kind}</Badge>
                  <p className="text-base font-display font-semibold mt-1">{e.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(e.starts_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => remove(e.id)}><Trash2 size={14} className="text-destructive" /></Button>
              </div>
              {e.location && <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={11} /> {e.location}</p>}
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1 border-t">
                <span className="flex items-center gap-1"><Users size={12} /> {rsvpCounts[e.id] ?? 0}{e.capacity ? ` / ${e.capacity}` : ""} going</span>
                {e.fundraising_target && (
                  <span className="flex items-center gap-1"><Trophy size={12} className="text-gold" /> £{Number(e.fundraising_raised).toLocaleString()} of £{Number(e.fundraising_target).toLocaleString()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New event</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} /></div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Starts at</Label><Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({...form, starts_at: e.target.value})} /></div>
              <div className="space-y-1.5">
                <Label>Kind</Label>
                <Select value={form.kind} onValueChange={(v) => setForm({...form, kind: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {KINDS.map((k) => <SelectItem key={k} value={k} className="capitalize">{k}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({...form, location: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Capacity</Label><Input type="number" value={form.capacity} onChange={(e) => setForm({...form, capacity: e.target.value})} /></div>
              <div className="space-y-1.5"><Label>Fundraising target (£)</Label><Input type="number" value={form.fundraising_target} onChange={(e) => setForm({...form, fundraising_target: e.target.value})} /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={create} disabled={saving}>{saving && <Loader2 size={14} className="animate-spin mr-1.5" />} Create</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}