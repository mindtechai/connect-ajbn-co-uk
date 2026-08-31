import { CalendarDays, MapPin, Ticket, ExternalLink } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/lib/router-compat";
import { splitEvents, type EventItem } from "@/lib/publicEvents";
import { FlagshipSponsors } from "@/components/FlagshipSponsors";

/**
 * Public, server-rendered view of the AJBN event programme.
 *
 * Signed-out visitors and crawlers get the full public event detail
 * (name, date, time, venue, organiser, audience, sectors, ticketing) with no
 * member-only data. Signed-in members continue to see the member RSVP page.
 */

function formatDate(iso: string, fallback?: string) {
  if (fallback) return fallback;
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

function EventArticle({ event, past }: { event: EventItem; past?: boolean }) {
  return (
    <article
      id={event.id}
      className="scroll-mt-24 rounded-xl border bg-card p-6 shadow-sm"
      aria-labelledby={`${event.id}-title`}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Badge variant="outline" className="capitalize">
          {event.kind === "fundraising" ? "Fundraising event" : "Networking event"}
        </Badge>
        {past && <Badge variant="secondary">Past event</Badge>}
        {event.isPlaceholder && !past && <Badge variant="secondary">Details to be announced</Badge>}
      </div>

      <h3 id={`${event.id}-title`} className="text-xl md:text-2xl font-display font-bold text-primary">
        {event.title}
      </h3>
      {event.subtitle && <p className="text-sm text-muted-foreground mt-1">{event.subtitle}</p>}

      <dl className="mt-4 grid gap-2 text-sm">
        <div className="flex items-start gap-2">
          <CalendarDays size={16} className="mt-0.5 text-teal" aria-hidden />
          <div>
            <dt className="sr-only">Date and time</dt>
            <dd>
              <time dateTime={event.date}>{formatDate(event.date, event.dateLabel)}</time>
              {" · "}
              {event.timeLabel}
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin size={16} className="mt-0.5 text-teal" aria-hidden />
          <div>
            <dt className="sr-only">Venue</dt>
            <dd>{event.location}</dd>
          </div>
        </div>
        {event.price && (
          <div className="flex items-start gap-2">
            <Ticket size={16} className="mt-0.5 text-teal" aria-hidden />
            <div>
              <dt className="sr-only">Tickets</dt>
              <dd>{event.price}</dd>
            </div>
          </div>
        )}
      </dl>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{event.description}</p>

      {event.highlights && event.highlights.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm text-muted-foreground list-disc pl-5">
          {event.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}

      {event.hostName && (
        <p className="mt-4 text-sm">
          <span className="font-semibold text-primary">{event.hostName}</span>
          {event.hostWebsiteUrl && (
            <>
              {" — "}
              <a
                href={event.hostWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-teal hover:underline"
              >
                {event.hostWebsiteLabel ?? event.hostWebsiteUrl}
                <ExternalLink size={12} aria-hidden />
              </a>
            </>
          )}
        </p>
      )}

      {!past && (
        <p className="mt-5 text-sm">
          {event.ctaHref.startsWith("/") ? (
            <Link to={event.ctaHref} className="font-semibold text-teal hover:underline">
              {event.ctaLabel} for {event.title}
            </Link>
          ) : (
            <Link to="/register" className="font-semibold text-teal hover:underline">
              Register as an AJBN member to attend {event.title}
            </Link>
          )}
        </p>
      )}
    </article>
  );
}

export function PublicEventsView({ now }: { now: number }) {
  const { upcoming, past } = splitEvents(now);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="relative pt-32 pb-12 bg-hero-pattern overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <p className="text-primary-foreground/70 text-xs md:text-sm tracking-[0.2em] uppercase mb-4">
            Asian Jewish Business Network
          </p>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground leading-[1.05] mb-6">
            AJBN <span className="text-gradient-gold">Events</span> in London
          </h1>
          <p className="text-primary-foreground/75 text-lg leading-relaxed max-w-3xl">
            The Asian Jewish Business Network (AJBN) runs a London-based B2B events programme for
            founders, investors, property developers, capital providers and professional advisers.
            The programme combines bimonthly members' evenings hosted by member firms with an annual
            flagship networking exhibition. Events are organised by AJBN and delivered through{" "}
            <Link to="/" className="underline decoration-gold/60">
              AJBN Connect
            </Link>
            , the network's member platform.
          </p>
        </div>
      </section>

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl space-y-16">
          <section aria-labelledby="upcoming-events-heading">
            <h2
              id="upcoming-events-heading"
              className="text-2xl md:text-3xl font-display font-bold text-primary mb-6"
            >
              Upcoming AJBN events
            </h2>
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                The next event programme is being finalised.{" "}
                <Link to="/contact" className="text-teal hover:underline">
                  Contact the AJBN team
                </Link>{" "}
                for dates.
              </p>
            ) : (
              <div className="space-y-6">
                {upcoming.map((e) => (
                  <EventArticle key={e.id} event={e} />
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="flagship-sponsors-heading">
            <h2
              id="flagship-sponsors-heading"
              className="text-2xl md:text-3xl font-display font-bold text-primary mb-6"
            >
              Flagship event sponsors and partners
            </h2>
            <FlagshipSponsors />
            <p className="mt-6 text-sm text-muted-foreground">
              See the full list of{" "}
              <Link to="/sponsors-partners" className="text-teal hover:underline">
                AJBN sponsors and partners
              </Link>{" "}
              or read about{" "}
              <Link to="/tickets/flagship" className="text-teal hover:underline">
                tickets and exhibitor stands for the AJBN flagship networking day
              </Link>
              .
            </p>
          </section>

          {past.length > 0 && (
            <section aria-labelledby="past-events-heading">
              <h2
                id="past-events-heading"
                className="text-2xl md:text-3xl font-display font-bold text-primary mb-6"
              >
                Past AJBN events
              </h2>
              <div className="space-y-6">
                {past.map((e) => (
                  <EventArticle key={e.id} event={e} past />
                ))}
              </div>
            </section>
          )}

          <section aria-labelledby="events-ecosystem-heading" className="border-t pt-10">
            <h2
              id="events-ecosystem-heading"
              className="text-2xl md:text-3xl font-display font-bold text-primary mb-4"
            >
              Who attends AJBN events
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              AJBN events bring together corporate members and guests across property, property and
              bridging finance, banking, law, accountancy, financial advice, technology and business
              services. Attendees typically use the network to meet counterparties through{" "}
              <Link to="/services" className="text-teal hover:underline">
                AJBN Capital Connect and the network's advisory services
              </Link>
              , to earn introductions through the{" "}
              <Link to="/referral-rewards" className="text-teal hover:underline">
                AJBN referral rewards programme
              </Link>
              , and to support the charitable work of the{" "}
              <Link to="/lions" className="text-teal hover:underline">
                AJBN Impact Lions Club
              </Link>
              . Event registration and RSVPs are handled inside the member area —{" "}
              <Link to="/register" className="text-teal hover:underline">
                apply for AJBN membership
              </Link>{" "}
              to take part.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
