import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Ticket, ArrowLeft, ExternalLink, Crown } from "lucide-react";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";
import impactLionsLogo from "@/assets/impact-lions-logo.png.asset.json";
import { assetUrl } from "@/lib/asset";

const EXTERNAL_TICKETS_URL = "https://www.ajbn.co.uk/buy-tickets/";

export default function BuyTicketsFlagshipPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Branded header — both logos are back-nav entry points */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex items-center justify-between gap-4">
          <Link
            to="/"
            aria-label="Asian Jewish Business Network — back to home"
            className="flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <img
              src={assetUrl(ajbnLogo)}
              alt="Asian Jewish Business Network logo"
              className="h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 rounded-lg object-cover shadow-md ring-2 ring-gold/60 shrink-0"
            />
            <span className="font-display text-base sm:text-lg lg:text-xl font-bold text-primary hidden sm:inline">
              Asian Jewish Business Network
            </span>
          </Link>
          <Link
            to="/lions"
            aria-label="AJBN Impact Lions Club — visit page"
            className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
          >
            <img
              src={assetUrl(impactLionsLogo)}
              alt="AJBN Impact Lions Club logo"
              className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 object-contain hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-10 max-w-3xl">
        <Link
          to="/#events"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft size={14} /> Back to events
        </Link>

        <div className="rounded-2xl border bg-card shadow-sm p-6 md:p-10 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Crown size={12} className="mr-1" /> Flagship Event
            </Badge>
            <Badge variant="outline">Tickets on sale</Badge>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary">
              AJBN Flagship Networking Day
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              The UK's only platform dedicated to fostering commercial ties between the
              Asian and Jewish business communities. Senior leaders across Finance,
              Property, Banking, Law, Technology and Business Services meet for
              collaboration and knowledge exchange.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-start gap-2">
              <CalendarDays size={16} className="text-primary mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">Monday, 19 October 2026</div>
                <div className="text-muted-foreground">10:00 AM – 4:00 PM</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
              <div>
                <div className="font-medium">London Marriott Hotel</div>
                <div className="text-muted-foreground">128 King Henry's Rd, London NW3 3BY</div>
              </div>
            </div>
          </div>

          <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
            <li>• 50+ high-value exhibitors</li>
            <li>• Hundreds of senior professionals</li>
            <li>• Unmatched networking opportunities</li>
            <li>• Sponsorship, stands &amp; brand exposure</li>
          </ul>

          <div className="pt-4 border-t flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-2xl font-display font-bold text-primary">
                £60 <span className="text-sm text-muted-foreground font-normal">+ VAT per ticket</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="lg">
                <a href={EXTERNAL_TICKETS_URL} target="_blank" rel="noopener noreferrer">
                  <Ticket className="mr-2" size={16} /> Buy tickets on ajbn.co.uk
                  <ExternalLink className="ml-2" size={14} />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="mailto:Russell@springadconsultancy.co.uk,Bianca@springadconsultancy.co.uk?subject=AJBN%20Exhibitor%20Enquiry">
                  Exhibit with us
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}