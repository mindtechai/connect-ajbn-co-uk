import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { FlagshipSponsors } from "@/components/FlagshipSponsors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Users,
  Ticket,
  Search,
  Building2,
  Loader2,
  ExternalLink,
} from "lucide-react";

const BASE = "https://connect.ajbn.co.uk";
const TITLE = "Annual Flagship Event — 19 Oct | AJBN";
const DESCRIPTION =
  "AJBN Annual Flagship Event, Sunday 19 October 2026, 10:00–16:00 at London Marriott Swiss Cottage. 50+ high-value exhibitors, 600 guests last year. Book your place.";
const BOOKING_URL = "https://www.ajbn.co.uk/buy-tickets/";

type Exhibitor = {
  id: string;
  company_name: string;
  primary_sector: string | null;
  short_bio: string | null;
  services_list: string[] | null;
  website: string | null;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

// Guard against free-text websites saved without a scheme, which the
// browser would otherwise resolve as a relative in-app path.
function exhibitorWebsite(url: string | null) {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed || trimmed === "#") return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

const eventSchema = {
  "@context": "https://schema.org",
  "@type": "BusinessEvent",
  name: "AJBN Annual Flagship Event",
  description: DESCRIPTION,
  startDate: "2026-10-19T10:00:00+01:00",
  endDate: "2026-10-19T16:00:00+01:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  url: `${BASE}/events/flagship`,
  location: {
    "@type": "Place",
    name: "London Marriott Swiss Cottage",
    address: "128 King Henry's Rd, London NW3 3BY",
  },
  organizer: {
    "@type": "Organization",
    "@id": `${BASE}/#organization`,
    name: "Asian Jewish Business Network",
    url: BASE,
  },
  offers: {
    "@type": "Offer",
    url: BOOKING_URL,
    availability: "https://schema.org/InStock",
  },
};

function FlagshipEventPage() {
  const [exhibitors, setExhibitors] = useState<Exhibitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<Exhibitor | null>(null);

  useEffect(() => {
    (async () => {
      // corporate_members is not readable by signed-out visitors (RLS), so the
      // public pages fetch exhibitors through this locked-down public function.
      const { data } = await supabase.rpc("public_flagship_exhibitors");
      setExhibitors((data ?? []) as Exhibitor[]);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return exhibitors;
    return exhibitors.filter(
      (e) =>
        e.company_name.toLowerCase().includes(q) ||
        (e.primary_sector ?? "").toLowerCase().includes(q) ||
        (e.services_list ?? []).some((s) => s.toLowerCase().includes(q)),
    );
  }, [exhibitors, query]);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-6 md:py-10 space-y-10">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft size={14} /> Events
        </Link>

        {/* Hero */}
        <header className="space-y-4">
          <Badge className="bg-primary/10 text-primary border-primary/20">Flagship Event</Badge>
          <h1 className="text-3xl md:text-4xl font-display font-bold">Annual Flagship Event</h1>
          <div className="space-y-1.5 text-sm text-muted-foreground">
            <p className="flex items-center gap-2">
              <CalendarDays size={14} className="text-primary" /> Sunday 19 October 2026 · 10:00–16:00
            </p>
            <p className="flex items-center gap-2">
              <MapPin size={14} className="text-primary" /> London Marriott Swiss Cottage, 128 King Henry's Rd, NW3 3BY
            </p>
            <p className="flex items-center gap-2">
              <Users size={14} className="text-primary" /> 50+ high-value exhibitors · 600 guests last year
            </p>
          </div>
          <Button asChild size="lg" className="w-full sm:w-auto">
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
              <Ticket size={16} className="mr-1" /> Book your place
            </a>
          </Button>
        </header>

        {/* Sponsors */}
        <section className="space-y-3">
          <h2 className="text-lg font-display font-semibold">Our Sponsors</h2>
          <FlagshipSponsors />
        </section>

        {/* Exhibitors */}
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-display font-semibold">
              Exhibitors{exhibitors.length > 0 ? ` (${exhibitors.length})` : ""}
            </h2>
            {exhibitors.length > 6 && (
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search exhibitors…"
                  className="pl-8"
                />
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : exhibitors.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
              Exhibitors announced soon.
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border bg-card p-8 text-center text-sm text-muted-foreground">
              No exhibitors match that search.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {filtered.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setOpen(e)}
                  className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center hover:border-primary/40 hover:shadow-xs transition"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary font-display font-semibold">
                    {initials(e.company_name)}
                  </span>
                  <span className="text-sm font-medium leading-tight line-clamp-2">{e.company_name}</span>
                  {e.primary_sector && (
                    <span className="text-[11px] text-muted-foreground line-clamp-1">{e.primary_sector}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {/* About */}
        <section className="space-y-2 border-t pt-6">
          <h2 className="text-lg font-display font-semibold">About the day</h2>
          <p className="text-sm text-muted-foreground">
            A day event where AJBN members showcase their businesses from stalls erected by AJBN,
            meeting hundreds of senior professionals from Finance, Property, Banking, Law,
            Technology and Business Services.
          </p>
          <p className="text-sm text-muted-foreground">
            50+ high-value exhibitors. 600 guests attended last year.
          </p>
        </section>
      </div>

      {/* Exhibitor profile sheet */}
      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          {open && (
            <div className="space-y-4 pb-4">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary font-display font-semibold text-sm">
                    {initials(open.company_name)}
                  </span>
                  {open.company_name}
                </SheetTitle>
                {open.primary_sector && (
                  <SheetDescription>{open.primary_sector}</SheetDescription>
                )}
              </SheetHeader>
              {open.short_bio && <p className="text-sm text-muted-foreground">{open.short_bio}</p>}
              {(open.services_list ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {open.services_list!.map((s) => (
                    <Badge key={s} variant="outline" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link to="/directory">
                    <Building2 size={14} className="mr-1" /> View in directory
                  </Link>
                </Button>
                {open.website &&
                  /^https?:\/\//i.test(
                    /^https?:\/\//i.test(open.website.trim())
                      ? open.website.trim()
                      : `https://${open.website.trim()}`
                  ) && (
                  <Button asChild size="sm" variant="ghost">
                    <a href={open.website.trim()} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={14} className="mr-1" /> Website
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export const Route = createFileRoute("/events/flagship")({
  component: FlagshipEventPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: `${BASE}/events/flagship` }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(eventSchema) }],
  }),
});
