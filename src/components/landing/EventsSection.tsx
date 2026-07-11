import { useMemo, useState, useCallback, useEffect } from "react";
import { CalendarDays, MapPin, Users, Crown, Trophy, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type EventItem = {
  id: string;
  kind: "networking" | "fundraising" | "coming_soon";
  title: string;
  subtitle?: string;
  date: string; // ISO
  dateLabel?: string;
  timeLabel: string;
  location: string;
  description: string;
  price?: string;
  ctaLabel: string;
  ctaHref: string;
  highlights?: string[];
  isPlaceholder?: boolean;
};

const EVENTS: EventItem[] = [
  {
    id: "members-evening-2026-07-09",
    kind: "networking",
    title: "AJBN Members' Evening",
    date: "2026-07-09T17:00:00Z",
    timeLabel: "6:00 PM – 9:00 PM",
    location: "Vyman House, 104 College Rd, Harrow, HA1 1BQ",
    description:
      "6:00 PM – 9:00 PM | Vyman House, 104 College Rd, Harrow, HA1 1BQ. Hosted by Vyman Solicitors on their fabulous terrace. Join us for an enjoyable evening of networking, drinks, and delicious food, all in the company of fellow AJBN members.",
    ctaLabel: "Register your interest",
    ctaHref: "mailto:info@ajbn.co.uk?subject=AJBN%20Members%27%20Evening%20Registration%20of%20Interest",
    highlights: [
      "Networking with fellow AJBN members",
      "Drinks & delicious food",
      "Hosted by Vyman Solicitors",
    ],
  },
  {
    id: "flagship-2026-10-19",
    kind: "networking",
    title: "AJBN Flagship Networking Day",
    date: "2026-10-19T10:00:00Z",
    timeLabel: "10:00 AM – 4:00 PM",
    location: "London Marriott Hotel, 128 King Henry's Rd, London NW3 3BY",
    description:
      "The UK's only platform dedicated to fostering commercial ties between the Asian and Jewish business communities. Senior leaders across Finance, Property, Banking, Law, Technology and Business Services meet for collaboration and knowledge exchange.",
    price: "£60 + VAT",
    ctaLabel: "Buy tickets",
    ctaHref: "/tickets/flagship",
    highlights: [
      "50+ high-value exhibitors",
      "Hundreds of senior professionals",
      "Unmatched networking opportunities",
      "Sponsorship, stands & brand exposure available",
    ],
  },
  {
    id: "autumn-showcase-2026-09",
    kind: "networking",
    title: "AJBN Members Only Autumn Showcase",
    subtitle: "Bimonthly Members-Only Meetup",
    date: "2026-09-18T18:00:00Z",
    dateLabel: "September 2026",
    timeLabel: "To Be Announced",
    location: "To be confirmed",
    description:
      "An exclusive, high-value networking and capital connection evening for registered members. Full details, venue, and guest speaker reveal coming soon.",
    ctaLabel: "Keep Me Updated",
    ctaHref: "#",
    isPlaceholder: true,
    highlights: ["High-Value Peer-to-Peer Engagement"],
  },
  {
    id: "winter-gala-2026-12",
    kind: "networking",
    title: "AJBN Members-Only Meetup",
    subtitle: "High-Value Peer-to-Peer Engagement",
    date: "2026-12-10T18:00:00Z",
    dateLabel: "December 2026",
    timeLabel: "To Be Announced / Coming Soon",
    location: "To be confirmed",
    description:
      "Our final bimonthly meetup of the year, bringing together members for targeted peer-to-peer engagement and deal-structuring before the festive break. Full details TBA shortly.",
    ctaLabel: "Keep Me Updated",
    ctaHref: "#",
    isPlaceholder: true,
    highlights: ["Bimonthly Members-Only Meetup"],
  },
];

const REGISTER_EVENT_ID = "members-evening-2026-07-09";
const PIPELINE_EVENT_ID = "upcoming-bimonthly-networking";
const ORGANISER_EMAIL = "info@ajbn.co.uk";

const PIPELINE_EVENT: EventItem = {
  id: PIPELINE_EVENT_ID,
  kind: "networking",
  title: "Upcoming Bimonthly In-Person Networking Event",
  date: "2026-07-10T00:00:00Z",
  dateLabel: "Date TBA",
  timeLabel: "To Be Announced",
  location: "London (Venue TBA)",
  description:
    "Register your interest now to be the first to hear about our next bimonthly in-person networking event in London. We'll confirm the venue, date, and full details with priority notice for registered members.",
  ctaLabel: "Register your interest",
  ctaHref: "#",
  isPlaceholder: true,
  highlights: [
    "Bimonthly in-person networking",
    "Priority registration for members",
    "London venue",
  ],
};


type Filter = "all" | "networking" | "fundraising";

export function EventsSection() {
  const [filter, setFilter] = useState<Filter>("all");
  const { user, session, roles } = useAuth();
  const isVerifiedMember =
    roles.includes("ajbn_member") ||
    roles.includes("impact_lion") ||
    roles.includes("super_admin");
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  // Load which events this user has already registered interest in, so the
  // button reflects the true state after a reload and duplicates are blocked
  // client-side before we even hit the database.
  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setRegisteredIds(new Set());
      return;
    }
    setLoadingRegistrations(true);
    (async () => {
      const { data, error } = await supabase
        .from("event_interests")
        .select("event_id")
        .eq("user_id", user.id);
      if (cancelled) return;
      if (!error && data) {
        setRegisteredIds(new Set(data.map((r) => r.event_id)));
      }
      setLoadingRegistrations(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const visible = useMemo(() => {
    const list = filter === "all" ? EVENTS : EVENTS.filter((e) => e.kind === filter);
    const sorted = [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const hasClosedSpecificEvent = EVENTS.some(
      (e) => !e.isPlaceholder && new Date(e.date) < new Date()
    );
    if (!hasClosedSpecificEvent || (filter !== "all" && filter !== "networking")) return sorted;
    const now = new Date();
    const lastPastIndex = sorted.length - 1 - [...sorted].reverse().findIndex((e) => new Date(e.date) < now);
    const insertIndex = lastPastIndex === sorted.length ? 0 : lastPastIndex + 1;
    const result = [...sorted];
    result.splice(insertIndex, 0, PIPELINE_EVENT);
    return result;
  }, [filter]);



  const openDialog = useCallback((id: string) => setOpenDialogId(id), []);
  const closeDialog = useCallback(() => setOpenDialogId(null), []);

  const handleRegister = useCallback(
    async (event: EventItem) => {
      if (!user || !session) return;
      if (!isVerifiedMember) {
        setAccessDenied(true);
        return;
      }
      if (registeredIds.has(event.id)) {
        toast("You've already registered for this event.");
        return;
      }
      setRegistering(true);
      try {
        // Store the interest in the database.
        const { error: insertError } = await supabase.from("event_interests").insert({
          user_id: user.id,
          event_id: event.id,
          event_title: event.title,
        });

        if (insertError) {
          // Unique violation is treated as "already registered".
          if (insertError.code === "23505") {
            toast("You've already registered for this event with this account.");
            setRegisteredIds((prev) => new Set(prev).add(event.id));
            return;
          } else {
            throw insertError;
          }
        } else {
          toast.success("You're registered for AJBN Members' Evening!");
        }

        setRegisteredIds((prev) => new Set(prev).add(event.id));

        // Send confirmation and organiser notification emails via the existing
        // transactional email Edge Function (if email infrastructure is set up).
        try {
          const profile = await supabase
            .from("profiles")
            .select("first_name,last_name,company")
            .eq("id", user.id)
            .single();

          const userEmail = user.email;
          const firstName = profile.data?.first_name ?? "";
          const lastName = profile.data?.last_name ?? "";
          const company = profile.data?.company ?? "";
          const fullName = `${firstName} ${lastName}`.trim() || userEmail;

          const baseData = {
            eventTitle: event.title,
            eventDate: new Date(event.date).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            eventTime: event.timeLabel,
            eventLocation: event.location,
            fullName,
            company,
            registrantEmail: userEmail,
          };

          if (userEmail) {
            await supabase.functions.invoke("send-transactional-email", {
              body: {
                templateName: "member-event-confirmation",
                recipientEmail: userEmail,
                idempotencyKey: `member-event-confirm-${event.id}-${user.id}`,
                templateData: baseData,
              },
            });
          }

          await supabase.functions.invoke("send-transactional-email", {
            body: {
              templateName: "member-event-notification",
              recipientEmail: ORGANISER_EMAIL,
              idempotencyKey: `member-event-notify-${event.id}-${user.id}`,
              templateData: baseData,
            },
          });
        } catch (emailErr) {
          console.error("Confirmation email failed", emailErr);
          // Don't block the user experience; the on-screen confirmation already happened.
        }
      } catch (err) {
        console.error("Registration failed", err);
        toast.error("Registration failed. Please try again or contact us.");
      } finally {
        setRegistering(false);
      }
    },
    [user, session, registeredIds, isVerifiedMember]
  );

  return (
    <TooltipProvider delayDuration={0}>
      <section id="events" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 max-w-5xl">
        <ScrollReveal>
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-3">Upcoming Events</Badge>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary">Events &amp; Networking</h2>
            <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
              Flagship networking days, curated roundtables and Impact Lions fundraisers — sorted by soonest first.
            </p>
          </div>
        </ScrollReveal>

        <div className="flex justify-center mb-8">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="networking" className="gap-1"><Users size={12} /> Networking</TabsTrigger>
              <TabsTrigger value="fundraising" className="gap-1"><Crown size={12} /> Impact Lions</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {visible.length === 0 ? (
          <div className="bg-card border rounded-xl p-12 text-center">
            <p className="text-sm text-muted-foreground">
              No upcoming {filter === "fundraising" ? "Impact Lions" : filter === "networking" ? "networking" : ""} events. Check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            {visible.map((e) => {
              const d = new Date(e.date);
              const now = new Date();
              const isRegistered = registeredIds.has(e.id);
              const isPipelineEvent = e.id === PIPELINE_EVENT_ID;
              const isInterestDialog = e.id === REGISTER_EVENT_ID || isPipelineEvent;
              const isPastEvent = d < now && !isPipelineEvent;
              return (

                <ScrollReveal key={e.id}>
                  <article className="bg-card border border-border/60 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6 md:p-8 grid md:grid-cols-[auto,1fr,auto] gap-6 items-start">
                      <div className="flex md:flex-col items-center md:items-start gap-3 md:gap-1 md:min-w-[96px]">
                        {e.isPlaceholder ? (
                          <>
                            <div className="text-xs uppercase tracking-wide text-gold font-medium">{e.dateLabel}</div>
                            <div className="text-4xl md:text-5xl font-display font-bold text-gold leading-none">TBA</div>
                            <div className="text-xs text-muted-foreground">Coming soon</div>
                          </>
                        ) : (
                          <>
                            <div className="text-xs uppercase tracking-wide text-muted-foreground">
                              {d.toLocaleString("en-GB", { month: "short" })}
                            </div>
                            <div className="text-4xl md:text-5xl font-display font-bold text-primary leading-none">
                              {d.getUTCDate()}
                            </div>
                            <div className="text-xs text-muted-foreground">{d.getUTCFullYear()}</div>
                          </>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={e.isPlaceholder
                            ? "bg-gold/10 text-gold border-gold/30"
                            : e.kind === "fundraising"
                            ? "bg-gold/10 text-gold border-gold/30"
                            : "bg-teal/10 text-teal border-teal/20"}>
                            {e.isPlaceholder ? <><Crown size={10} className="mr-1" /> Coming Soon / TBA</>
                              : e.kind === "fundraising" ? <><Crown size={10} className="mr-1" /> Impact Lions</>
                              : <><Users size={10} className="mr-1" /> Networking</>}
                          </Badge>
                          {e.price && <Badge variant="outline" className="text-xs">{e.price}</Badge>}
                        </div>
                        <h3 className="text-xl md:text-2xl font-display font-semibold">{e.title}</h3>
                        {e.subtitle && <p className="text-xs text-gold font-medium">{e.subtitle}</p>}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><CalendarDays size={12} /> {e.timeLabel}</span>
                          <span className="flex items-center gap-1"><MapPin size={12} /> {e.location}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{e.description}</p>
                        {e.highlights && (
                          <ul className="grid sm:grid-cols-2 gap-1.5 text-xs pt-1">
                            {e.highlights.map((h) => (
                              <li key={h} className="flex items-start gap-1.5">
                                <Trophy size={12} className="text-gold mt-0.5 shrink-0" /> <span>{h}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="md:pt-1">
                        {isPastEvent ? (
                          <Button size="sm" disabled variant="outline">
                            Event Closed
                          </Button>
                        ) : e.isPlaceholder && e.id !== PIPELINE_EVENT_ID ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-block">
                                <Button size="sm" disabled variant="goldOutline">
                                  {e.ctaLabel}
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>Details releasing soon!</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : isInterestDialog ? (
                          <Button
                            size="sm"
                            onClick={() => openDialog(e.id)}
                            disabled={loadingRegistrations}
                            variant={isRegistered ? "outline" : "default"}
                          >
                            {isRegistered ? (
                              <><CheckCircle2 size={14} className="mr-1" /> Registered</>
                            ) : (
                              <>{e.ctaLabel} <ArrowRight size={14} className="ml-1" /></>
                            )}
                          </Button>
                        ) : (
                          <Button asChild size="sm">
                            {e.ctaHref.startsWith("/") ? (
                              <Link to={e.ctaHref}>
                                {e.ctaLabel} <ArrowRight size={14} className="ml-1" />
                              </Link>
                            ) : (
                              <a href={e.ctaHref} target="_blank" rel="noopener noreferrer">
                                {e.ctaLabel} <ArrowRight size={14} className="ml-1" />
                              </a>
                            )}
                          </Button>
                        )}
                      </div>

                    </div>
                  </article>

                  {isInterestDialog && (
                    <Dialog open={openDialogId === e.id} onOpenChange={(open) => !open && closeDialog()}>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            {isRegistered ? "You're registered!" : "Register your interest"}
                          </DialogTitle>
                          <DialogDescription>
                            {e.title} — {d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                          </DialogDescription>
                        </DialogHeader>

                        {isRegistered ? (
                          <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3 rounded-lg border border-teal/30 bg-teal/5 p-4">
                              <CheckCircle2 className="text-teal mt-0.5 shrink-0" size={20} />
                              <div className="space-y-1">
                                <p className="font-medium text-foreground">
                                  Thanks — your interest is confirmed.
                                </p>
                                <p className="text-muted-foreground">
                                  We've saved your spot for {e.title} and notified the organisers.
                                  {user?.email && (
                                    <> A confirmation email is on its way to <span className="font-medium text-foreground">{user.email}</span>.</>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                              <span className="flex items-center gap-1"><CalendarDays size={14} /> {e.timeLabel}</span>
                              <span className="flex items-center gap-1"><MapPin size={14} /> {e.location}</span>
                            </div>
                          </div>
                        ) : (
                        <div className="space-y-3 text-sm">
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
                            <span className="flex items-center gap-1"><CalendarDays size={14} /> {e.timeLabel}</span>
                            <span className="flex items-center gap-1"><MapPin size={14} /> {e.location}</span>
                          </div>
                          <p className="text-muted-foreground">{e.description}</p>

                          {user ? (
                            <p className="text-muted-foreground">
                              We will send a confirmation email to {user.email} and notify the organisers.
                            </p>
                          ) : (
                            <p className="text-muted-foreground">
                              Sign in to register your interest and receive a confirmation email.
                            </p>
                          )}
                        </div>
                        )}

                        <DialogFooter>
                          {isRegistered ? (
                            <Button onClick={closeDialog} variant="outline" className="w-full sm:w-auto">
                              Close
                            </Button>
                          ) : user ? (
                            <Button onClick={() => handleRegister(e)} disabled={registering} className="w-full sm:w-auto">
                              {registering ? "Registering…" : "Confirm registration"}
                            </Button>
                          ) : (
                            <Link to="/login" className="w-full sm:w-auto">
                              <Button className="w-full">Sign in to register</Button>
                            </Link>
                          )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </ScrollReveal>
              );
            })}
          </div>
        )}

        <Dialog open={accessDenied} onOpenChange={setAccessDenied}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Access Denied</DialogTitle>
              <DialogDescription>
                This event is strictly reserved for verified AJBN members. Uninvited third-party registrations are prohibited.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setAccessDenied(false)} variant="outline" className="w-full sm:w-auto">Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
    </TooltipProvider>
  );
}
