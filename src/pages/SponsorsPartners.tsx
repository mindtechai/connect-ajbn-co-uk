import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const EXTERNAL_URL = "https://www.ajbn.co.uk/sponsors-partners/";

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