import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CalendarDays, MapPin, Users, Loader2, Crown, Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type EventRow = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  kind: string;
  capacity: number | null;
  fundraising_target: number | null;
  fundraising_raised: number;
  cover_image_url: string | null;
};

type Rsvp = { event_id: string; status: string; guests: number };

const KIND_STYLE: Record<string, string> = {
  networking: "bg-teal/10 text-teal border-teal/20",
  fundraising: "bg-gold/10 text-gold border-gold/30",
  flagship: "bg-primary/10 text-primary border-primary/20",
  roundtable: "bg-muted text-muted-foreground border-border",
  other: "bg-muted text-muted-foreground border-border",
};

export default function EventsPage() {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, Rsvp>>({});
  const [attendeeCounts, setAttendeeCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: ev }, { data: mine }, { data: allRsvps }] = await Promise.all([
      supabase.from("events").select("*").gte("starts_at", new Date().toISOString()).order("starts_at", { ascending: true }),
      supabase.from("event_rsvps").select("event_id, status, guests").eq("user_id", user.id),
      supabase.from("event_rsvps").select("event_id, status, guests"),
    ]);
    setEvents((ev ?? []) as EventRow[]);
    const map: Record<string, Rsvp> = {};
    for (const r of (mine ?? []) as Rsvp[]) map[r.event_id] = r;
    setRsvps(map);
    const counts: Record<string, number> = {};
    for (const r of (allRsvps ?? []) as Rsvp[]) {
      if (r.status === "going") counts[r.event_id] = (counts[r.event_id] ?? 0) + 1 + (r.guests ?? 0);
    }
    setAttendeeCounts(counts);
    setLoading(false);
  };

  useEffect(() => { if (!authLoading && user) load(); }, [user, authLoading]);

  const rsvp = async (eventId: string, status: "going" | "waitlist" | "declined") => {
    if (!user) return;
    const { error } = await supabase.from("event_rsvps").upsert(
      { event_id: eventId, user_id: user.id, status, guests: 0 },
      { onConflict: "event_id,user_id" }
    );
    if (error) { toast({ title: "RSVP failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: status === "going" ? "You're going" : status === "waitlist" ? "Added to waitlist" : "Declined" });
    load();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-8 h-14 flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm">
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-2">
            <CalendarDays size={22} /> Upcoming events
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Networking dinners, roundtables, and Impact Lions fundraisers.</p>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : events.length === 0 ? (
          <div className="bg-card border rounded-xl p-12 text-center">
            <p className="text-sm text-muted-foreground">No upcoming events. Check back soon.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((e) => {
              const my = rsvps[e.id];
              const going = attendeeCounts[e.id] ?? 0;
              const pct = e.fundraising_target && Number(e.fundraising_target) > 0
                ? Math.min(100, Math.round((Number(e.fundraising_raised) / Number(e.fundraising_target)) * 100))
                : null;
              return (
                <div key={e.id} className="bg-card border rounded-xl shadow-sm overflow-hidden">
                  {e.cover_image_url && (
                    <img src={e.cover_image_url} alt="" className="w-full h-40 object-cover" />
                  )}
                  <div className="p-5 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-xs capitalize ${KIND_STYLE[e.kind] ?? KIND_STYLE.other}`}>
                            {e.kind === "fundraising" && <Crown size={10} className="mr-1" />}
                            {e.kind}
                          </Badge>
                          {my?.status === "going" && <Badge variant="outline" className="text-xs bg-teal/5 text-teal border-teal/30">You're going</Badge>}
                        </div>
                        <h2 className="text-lg font-display font-semibold mt-1">{e.title}</h2>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(e.starts_at).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                          {e.location && <> · <MapPin size={11} className="inline mb-0.5" /> {e.location}</>}
                        </p>
                      </div>
                    </div>

                    {e.description && <p className="text-sm text-muted-foreground whitespace-pre-line">{e.description}</p>}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1"><Users size={12} /> {going}{e.capacity ? ` / ${e.capacity}` : ""} going</span>
                    </div>

                    {pct !== null && (
                      <div className="space-y-1 pt-2 border-t">
                        <div className="flex justify-between text-xs">
                          <span className="flex items-center gap-1 text-muted-foreground"><Trophy size={12} className="text-gold" /> Fundraising</span>
                          <span className="font-medium">£{Number(e.fundraising_raised).toLocaleString()} of £{Number(e.fundraising_target).toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t">
                      <Button size="sm" variant={my?.status === "going" ? "default" : "outline"} onClick={() => rsvp(e.id, "going")}>
                        Going
                      </Button>
                      <Button size="sm" variant={my?.status === "waitlist" ? "default" : "outline"} onClick={() => rsvp(e.id, "waitlist")}>
                        Waitlist
                      </Button>
                      <Button size="sm" variant={my?.status === "declined" ? "default" : "outline"} onClick={() => rsvp(e.id, "declined")}>
                        Can't attend
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}