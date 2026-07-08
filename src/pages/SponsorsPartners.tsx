import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const EXTERNAL_URL = "https://www.ajbn.co.uk/sponsors-partners/";

const SPONSORS = [
  {
    name: "SCW Legal",
    role: "Headline Sponsor — Law Firm",
    website: "https://www.scwlegal.co.uk/",
    websiteLabel: "www.scwlegal.co.uk",
    logo: "https://asian-jewish-business-network-cdn.s3.eu-west-2.amazonaws.com/wp-content/uploads/2024/05/17102554/SCW-Logo-Stamp-Dark-Grey-3-600x600.png",
  },
  {
    name: "Tradelend",
    role: "Headline Sponsor — Property Finance",
    website: "https://www.tradelend.com/",
    websiteLabel: "www.tradelend.com",
    logo: "https://asian-jewish-business-network-cdn.s3.eu-west-2.amazonaws.com/wp-content/uploads/2026/06/30222931/1-600x200.png",
  },
];

export default function SponsorsPartnersPage() {
  return (
    <AppLayout back={{ to: "/", label: "Back to AJBN Connect" }} maxWidth="4xl">
      <div className="space-y-8">
        <header className="space-y-3">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-primary">
            Sponsors &amp; Partners
          </h1>
          <p className="text-muted-foreground leading-relaxed max-w-2xl">
            Explore the organisations that support the Asian Jewish Business Network
            and help us strengthen professional ties across communities.
          </p>
        </header>

        <section aria-labelledby="headline-sponsors" className="space-y-4">
          <h2
            id="headline-sponsors"
            className="font-display text-xs md:text-sm font-semibold tracking-[0.2em] uppercase text-muted-foreground"
          >
            Headline Sponsors &amp; Partners
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {SPONSORS.map((s) => (
              <article
                key={s.name}
                className="rounded-xl border bg-card p-6 shadow-sm flex flex-col items-center text-center gap-4"
              >
                <div className="w-full h-32 flex items-center justify-center">
                  <img
                    src={s.logo}
                    alt={`${s.name} logo`}
                    loading="lazy"
                    className="max-h-28 max-w-[80%] object-contain"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-lg font-bold text-primary">{s.name}</h3>
                  <p className="text-sm text-muted-foreground">{s.role}</p>
                </div>
                <a
                  href={s.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1.5"
                >
                  {s.websiteLabel}
                  <ExternalLink size={14} />
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6 md:p-8 shadow-sm space-y-5">
          <p className="text-sm text-muted-foreground">
            Our full, up-to-date sponsors and partners directory is maintained on the
            AJBN public website. Open it below — you can return to the app at any
            time using the link at the top of this page.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={EXTERNAL_URL} target="_blank" rel="noopener noreferrer">
              <Button size="lg">
                Visit Sponsors &amp; Partners
                <ExternalLink className="ml-2" size={16} />
              </Button>
            </a>
            <Link to="/">
              <Button variant="outline" size="lg">
                <ArrowLeft className="mr-2" size={16} />
                Return to AJBN Connect
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}