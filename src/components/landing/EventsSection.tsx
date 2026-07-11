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
    location: "London - Venue TBA",
    description:
      "An exclusive, high-value networking and capital connection evening for registered members. Full details, venue, and guest speaker reveal coming soon.",
    ctaLabel: "Register your interest",
    ctaHref: "#",
    isPlaceholder: true,
    highlights: ["High-Value Peer-to-Peer Engagement"],
  },
  {
    id: "winter-gala-2026-12",
    kind: "networking",
    title: "AJBN Members-Only Networking Event",
    subtitle: "High-Value Peer-to-Peer Engagement",
    date: "2026-12-10T18:00:00Z",
    dateLabel: "December 2026",
    timeLabel: "To Be Announced / Coming Soon",
    location: "London - Venue TBA",
    description:
      "Our final bimonthly meetup of the year, bringing together members for targeted peer-to-peer engagement and deal-structuring before the festive break. Full details TBA shortly.",
    ctaLabel: "Register your interest",
    ctaHref: "#",
    isPlaceholder: true,
    highlights: ["Bimonthly Members-Only Meetup"],
  },
];

const INTEREST_EVENT_IDS = new Set([
  "members-evening-2026-07-09",
  "autumn-showcase-2026-09",
  "winter-gala-2026-12",
]);
const ORGANISER_EMAIL = "info@ajbn.co.uk";


type Filter = "all" | "networking" | "fundraising";

export function EventsSection() {
  const [filter, setFilter] = useState<Filter>("all");
  const { user, session } = useAuth();
  const [openDialogId, setOpenDialogId] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);
  const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  // Demo-only: load which events this user has already registered interest in
  // from local storage so the button reflects the true state after a reload.
  // No backend API calls are used for the hackathon presentation.
  useEffect(() => {
    if (!user) {
      setRegisteredIds(new Set());
      setLoadingRegistrations(false);
      return;
    }
    setLoadingRegistrations(true);
    try {
      const raw = localStorage.getItem("ajbn_demo_event_registrations");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setRegisteredIds(new Set(parsed));
        }
      }
    } catch {
      // ignore localStorage errors
    } finally {
      setLoadingRegistrations(false);
    }
  }, [user]);

  const visible = useMemo(() => {
    const list = filter === "all" ? EVENTS : EVENTS.filter((e) => e.kind === filter);
    return [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filter]);



  const openDialog = useCallback((id: string) => setOpenDialogId(id), []);
  const closeDialog = useCallback(() => setOpenDialogId(null), []);

  const handleRegister = useCallback(
    async (event: EventItem) => {
      if (!user || !session) return;
      if (registeredIds.has(event.id)) {
        toast("You've already registered for this event.");
        return;
      }
      setRegistering(true);
      // Demo-only: bypass all database/API mutations. Persist registration
      // locally, show the success toast, and close the modal.
      setTimeout(() => {
        const next = new Set(registeredIds);
        next.add(event.id);
        setRegisteredIds(next);
        try {
          localStorage.setItem(
            "ajbn_demo_event_registrations",
            JSON.stringify(Array.from(next))
          );
        } catch {
          // ignore localStorage errors
        }
        toast.success("Registration Confirmed!", {
          description: `You're registered for ${event.title}.`,
        });
        closeDialog();
        setRegistering(false);
      }, 400);
    },
    [user, session, registeredIds, closeDialog]
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
              const isInterestDialog = INTEREST_EVENT_IDS.has(e.id);
              const isPastEvent = d < now;
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
                            Registration Closed
                          </Button>
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
                        ) : e.isPlaceholder ? (
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

      </div>
    </section>
    </TooltipProvider>
  );
}
