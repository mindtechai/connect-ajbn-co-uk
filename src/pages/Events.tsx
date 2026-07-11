import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, Loader2, Crown, Trophy, QrCode } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { EventQRCode } from "@/components/EventQRCode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

type Rsvp = { event_id: string; status: string; guests: number; checkin_token?: string | null };

const KIND_STYLE: Record<string, string> = {
  networking: "bg-teal/10 text-teal border-teal/20",
  fundraising: "bg-gold/10 text-gold border-gold/30",
  flagship: "bg-primary/10 text-primary border-primary/20",
  roundtable: "bg-muted text-muted-foreground border-border",
  other: "bg-muted text-muted-foreground border-border",
};

const PIPELINE_EVENT = {
  id: "upcoming-bimonthly-networking",
  kind: "networking",
  title: "Upcoming Bimonthly In-Person Networking Event",
  subtitle: "Bimonthly In-Person Networking",
  dateLabel: "Date TBA",
  timeLabel: "To Be Announced",
  location: "London (Venue TBA)",
  description:
    "Register your interest now to be the first to hear about our next bimonthly in-person networking event in London. We'll confirm the venue, date, and full details with priority notice for registered members.",
  highlights: [
    "Bimonthly in-person networking",
    "Priority registration for members",
    "London venue",
  ],
};

const PLACEHOLDER_EVENTS = [
  {

    id: "autumn-showcase-2026-09",
    kind: "networking",
    title: "AJBN Members Only Autumn Showcase",
    subtitle: "Bimonthly Members-Only Meetup",
    dateLabel: "September 2026",
    timeLabel: "To Be Announced",
    location: "To be confirmed",
    description:
      "An exclusive, high-value networking and capital connection evening for registered members. Full details, venue, and guest speaker reveal coming soon.",
    highlights: ["High-Value Peer-to-Peer Engagement"],
  },
  {
    id: "winter-gala-2026-12",
    kind: "networking",
    title: "AJBN Members-Only Meetup",
    subtitle: "High-Value Peer-to-Peer Engagement",
    dateLabel: "December 2026",
    timeLabel: "To Be Announced / Coming Soon",
    location: "To be confirmed",
    description:
      "Our final bimonthly meetup of the year, bringing together members for targeted peer-to-peer engagement and deal-structuring before the festive break. Full details TBA shortly.",
    highlights: ["Bimonthly Members-Only Meetup"],
  },
];

export default function EventsPage() {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, Rsvp>>({});
  const [attendeeCounts, setAttendeeCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "networking" | "fundraising">("all");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: ev }, { data: mine }, { data: allRsvps }] = await Promise.all([
      supabase.from("events").select("*").gte("starts_at", new Date().toISOString()).order("starts_at", { ascending: true }),
      supabase.from("event_rsvps").select("event_id, status, guests, checkin_token").eq("user_id", user.id),
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
    <AppLayout maxWidth="4xl">

      <>
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-2">
            <CalendarDays size={22} /> Upcoming events
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Networking dinners, roundtables, and Impact Lions fundraisers.</p>
        </div>

        {/* Flagship event highlight */}
        <div className="mb-8 bg-gradient-to-br from-primary/10 via-teal/5 to-gold/10 border border-primary/20 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Crown size={10} className="mr-1" /> Flagship Event
              </Badge>
              <Badge variant="outline" className="text-xs">Tickets on sale</Badge>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-display font-bold">AJBN Flagship Networking Day</h2>
              <p className="text-sm text-muted-foreground mt-2">
                The Asian-Jewish Business Network is the UK's only platform dedicated to fostering commercial
                ties between the Asian and Jewish business communities. Join senior leaders from Finance,
                Property, Banking, Law, Technology, and Business Services for a day of collaboration,
                knowledge exchange, and mutual growth.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2"><CalendarDays size={14} className="text-primary" /> 19th October 2026 · 10AM – 4PM</div>
              <div className="flex items-center gap-2"><MapPin size={14} className="text-primary" /> London Marriott Hotel, 128 King Henry's Rd, London NW3 3BY</div>
              <div className="flex items-center gap-2"><Users size={14} className="text-primary" /> 50+ high-value exhibitors</div>
              <div className="flex items-center gap-2"><Trophy size={14} className="text-gold" /> Hundreds of senior professionals</div>
            </div>
            <div className="pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-lg font-display font-semibold">£60 <span className="text-xs text-muted-foreground font-normal">+ VAT per ticket</span></div>
                <div className="text-xs text-muted-foreground">Sponsorship, stands &amp; brand exposure available</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link to="/tickets/flagship">Buy tickets</Link>
                </Button>
                <Button asChild size="sm" variant="outline">
                  <a href="mailto:Russell@springadconsultancy.co.uk,Bianca@springadconsultancy.co.uk?subject=AJBN%20Exhibitor%20Enquiry">Exhibit with us</a>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-4">
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="networking" className="gap-1"><Users size={12} /> Networking</TabsTrigger>
            <TabsTrigger value="fundraising" className="gap-1"><Crown size={12} /> Impact Lions</TabsTrigger>
          </TabsList>
        </Tabs>

        {filter !== "fundraising" && (
          <div className="mb-8 space-y-4">
            <div className="bg-card border border-teal/20 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 md:p-6 grid md:grid-cols-[auto,1fr,auto] gap-5 items-start">
                <div className="flex md:flex-col items-center md:items-start gap-2 md:gap-1 md:min-w-[96px]">
                  <div className="text-xs uppercase tracking-wide text-teal font-medium">Date TBA</div>
                  <div className="text-4xl md:text-5xl font-display font-bold text-teal leading-none">TBA</div>
                  <div className="text-xs text-muted-foreground">Register interest</div>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-teal/10 text-teal border-teal/20">
                      <Users size={10} className="mr-1" /> Networking
                    </Badge>
                  </div>
                  <h3 className="text-lg font-display font-semibold">{PIPELINE_EVENT.title}</h3>
                  <p className="text-xs text-teal font-medium">{PIPELINE_EVENT.subtitle}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><CalendarDays size={12} /> {PIPELINE_EVENT.timeLabel}</span>
                    <span className="flex items-center gap-1"><MapPin size={12} /> {PIPELINE_EVENT.location}</span>
                  </div>
                  {PIPELINE_EVENT.highlights && (
                    <ul className="grid sm:grid-cols-2 gap-1.5 text-xs pt-1">
                      {PIPELINE_EVENT.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-1.5">
                          <Trophy size={12} className="text-gold mt-0.5 shrink-0" /> <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-sm text-muted-foreground">{PIPELINE_EVENT.description}</p>
                </div>
                <div className="md:pt-1">
                  <Button asChild size="sm" variant="outline">
                    <a href="mailto:info@ajbn.co.uk?subject=Register%20Interest%3A%20Upcoming%20Bimonthly%20In-Person%20Networking%20Event">Register your interest</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {(() => {
          const visiblePlaceholders = PLACEHOLDER_EVENTS.filter((p) => filter === "all" || p.kind === filter);
          if (visiblePlaceholders.length === 0) return null;
          return (
            <>
              {/* Coming soon placeholders */}

              <div className="mb-8 space-y-4">
                <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                  <Crown size={18} className="text-gold" /> Coming Soon / TBA
                </h2>
                <div className="grid gap-4">
                  {visiblePlaceholders.map((p) => (
                    <div key={p.id} className="bg-card border border-gold/20 rounded-2xl shadow-sm overflow-hidden">
                      <div className="p-5 md:p-6 grid md:grid-cols-[auto,1fr,auto] gap-5 items-start">
                        <div className="flex md:flex-col items-center md:items-start gap-2 md:gap-1 md:min-w-[96px]">
                          <div className="text-xs uppercase tracking-wide text-gold font-medium">{p.dateLabel}</div>
                          <div className="text-4xl md:text-5xl font-display font-bold text-gold leading-none">TBA</div>
                          <div className="text-xs text-muted-foreground">Coming soon</div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="bg-gold/10 text-gold border-gold/30">
                              <Crown size={10} className="mr-1" /> Coming Soon / TBA
                            </Badge>
                          </div>
                          <h3 className="text-lg font-display font-semibold">{p.title}</h3>
                          <p className="text-xs text-gold font-medium">{p.subtitle}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><CalendarDays size={12} /> {p.timeLabel}</span>
                            <span className="flex items-center gap-1"><MapPin size={12} /> {p.location}</span>
                          </div>
                          {p.highlights && (
                            <ul className="grid sm:grid-cols-2 gap-1.5 text-xs pt-1">
                              {p.highlights.map((h) => (
                                <li key={h} className="flex items-start gap-1.5">
                                  <Trophy size={12} className="text-gold mt-0.5 shrink-0" /> <span>{h}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                          <p className="text-sm text-muted-foreground">{p.description}</p>
                        </div>
                        <div className="md:pt-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="inline-block">
                                  <Button size="sm" disabled variant="goldOutline">Keep Me Updated</Button>
                                </span>
                              </TooltipTrigger>
                              <TooltipContent side="top"><p>Details releasing soon!</p></TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          );
        })()}

        {(() => {
          const visible = events.filter((e) =>
            filter === "all" ? true : filter === "fundraising" ? e.kind === "fundraising" : e.kind !== "fundraising"
          );
          return loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
          ) : visible.length === 0 ? (
          <div className="bg-card border rounded-xl p-12 text-center">
              <p className="text-sm text-muted-foreground">
                {filter === "all" ? "No upcoming events. Check back soon." : `No upcoming ${filter === "fundraising" ? "Impact Lions" : "networking"} events. Check back soon.`}
              </p>
          </div>
          ) : (
          <div className="space-y-4">
            {visible.map((e) => {
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
                      {my?.status === "going" && my.checkin_token && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="ml-auto"><QrCode size={14} /> My QR</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-xs">
                            <DialogHeader><DialogTitle>Check-in QR</DialogTitle></DialogHeader>
                            <div className="flex flex-col items-center gap-2 p-2">
                              <EventQRCode token={my.checkin_token} />
                              <p className="text-xs text-muted-foreground text-center">Show at the door for {e.title}.</p>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          );
        })()}
      </>
    </AppLayout>
  );
}
