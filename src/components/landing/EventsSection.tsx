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
import { Link } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FlagshipSponsors } from "@/components/FlagshipSponsors";
import { EVENTS, type EventItem } from "@/lib/publicEvents";


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

  // Load which events this user has already registered interest in from the
  // database, falling back to a local cache when the request fails offline.
  useEffect(() => {
    if (!user) {
      setRegisteredIds(new Set());
      setLoadingRegistrations(false);
      return;
    }
    let cancelled = false;
    setLoadingRegistrations(true);
    (async () => {
      try {
        const { data, error } = await supabase
          .from("event_interests")
          .select("event_id")
          .eq("user_id", user.id);
        if (error) throw error;
        if (cancelled) return;
        const ids = new Set((data ?? []).map((row) => row.event_id));
        setRegisteredIds(ids);
        try {
          localStorage.setItem("ajbn_event_registrations", JSON.stringify(Array.from(ids)));
        } catch {
          // ignore cache write errors
        }
      } catch {
        try {
          const raw = localStorage.getItem("ajbn_event_registrations");
          const parsed = raw ? JSON.parse(raw) : null;
          if (!cancelled && Array.isArray(parsed)) setRegisteredIds(new Set(parsed));
        } catch {
          // ignore cache read errors
        }
      } finally {
        if (!cancelled) setLoadingRegistrations(false);
      }
    })();
    return () => {
      cancelled = true;
    };
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
      try {
        const { error } = await supabase.from("event_interests").insert({
          user_id: user.id,
          event_id: event.id,
          event_title: event.title,
        });
        // Unique-violation means the interest is already recorded server-side.
        if (error && error.code !== "23505") throw error;

        const next = new Set(registeredIds);
        next.add(event.id);
        setRegisteredIds(next);
        try {
          localStorage.setItem("ajbn_event_registrations", JSON.stringify(Array.from(next)));
        } catch {
          // ignore cache write errors
        }
        toast.success("Registration Confirmed!", {
          description: `You're registered for ${event.title}. The AJBN team has been notified.`,
        });
        closeDialog();
      } catch (err) {
        toast.error("Registration failed", {
          description:
            err instanceof Error ? err.message : "Please try again in a moment.",
        });
      } finally {
        setRegistering(false);
      }
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
                  <article className="bg-card border border-border/60 rounded-2xl shadow-xs overflow-hidden hover:shadow-md transition-shadow">
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
                        {e.hostLogoUrl && (
                          <div className="flex items-center gap-3 pt-1">
                            <img
                              src={e.hostLogoUrl}
                              alt={e.hostName ?? "Host logo"}
                              className="h-10 w-auto rounded bg-background object-contain border border-border/60 p-1"
                              loading="lazy"
                            />
                            <div className="text-xs">
                              {e.hostName && <div className="font-medium text-foreground">{e.hostName}</div>}
                              {e.hostWebsiteUrl && (
                                <a
                                  href={e.hostWebsiteUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-teal hover:underline"
                                >
                                  {e.hostWebsiteLabel ?? e.hostWebsiteUrl}
                                </a>
                              )}
                            </div>
                          </div>
                        )}
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
                        {e.id === "flagship-2026-10-19" && (
                          <FlagshipSponsors compact />
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
                          {e.hostLogoUrl && (
                            <div className="flex items-center gap-3 rounded-lg border border-border/60 p-3">
                              <img
                                src={e.hostLogoUrl}
                                alt={e.hostName ?? "Host logo"}
                                className="h-12 w-auto object-contain"
                                loading="lazy"
                              />
                              <div className="text-xs">
                                {e.hostName && <div className="font-medium text-foreground">{e.hostName}</div>}
                                {e.hostWebsiteUrl && (
                                  <a
                                    href={e.hostWebsiteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-teal hover:underline"
                                  >
                                    {e.hostWebsiteLabel ?? e.hostWebsiteUrl}
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
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
