import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { CalendarDays, MapPin } from "lucide-react";

/**
 * Public, crawlable flagship-event section. Rendered on the unauthenticated
 * home page with semantic HTML so search and AI crawlers can read it directly.
 */
export function FlagshipEventSEOSection() {
  return (
    <section id="next-event" className="py-20 bg-background border-y" aria-labelledby="next-event-heading">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        <ScrollReveal>
          <p className="text-sm tracking-widest uppercase text-teal font-medium mb-3">
            High-profile London business networking events
          </p>
          <h2 id="next-event-heading" className="text-3xl md:text-4xl font-display font-bold text-primary mb-6">
            Next High-Profile B2B Event
          </h2>

          <article className="rounded-xl border bg-card p-6 md:p-8 shadow-xs">
            <h3 className="text-xl md:text-2xl font-display font-semibold text-foreground mb-4">
              AJBN Flagship B2B Networking Exhibition &amp; Corporate Event
            </h3>

            <p className="text-muted-foreground mb-3 flex items-start gap-2">
              <CalendarDays size={18} className="mt-0.5 text-gold shrink-0" aria-hidden="true" />
              <span>
                <strong className="text-foreground">Date:</strong>{" "}
                <time dateTime="2026-10-19">19 October 2026</time>
              </span>
            </p>

            <p className="text-muted-foreground mb-5 flex items-start gap-2">
              <MapPin size={18} className="mt-0.5 text-gold shrink-0" aria-hidden="true" />
              <span>
                <strong className="text-foreground">Venue:</strong> London Marriott Hotel Regent&apos;s Park,
                128 King Henry&rsquo;s Rd, London NW3 3BY
              </span>
            </p>

            <p className="text-muted-foreground mb-4">
              AJBN Connect is the digital hub for the Asian Jewish Business Network, a premier B2B networking
              organisation and professional corporate event management company. This flagship exhibition brings
              together founders, investors and corporate leaders for cross-communal business networking and
              B2B strategic partnerships London businesses can act on immediately.
            </p>

            <p className="text-muted-foreground mb-6">
              Expect curated introductions, an exhibition floor, and hosted sessions delivered by our
              corporate event management and exhibitions team — the standard our professional business
              networking club is known for.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link to="/register">
                <Button variant="default" size="lg">Register / Join Network</Button>
              </Link>
              <Link to="/tickets/flagship">
                <Button variant="outline" size="lg">Flagship event details</Button>
              </Link>
            </div>
          </article>
        </ScrollReveal>
      </div>
    </section>
  );
}
