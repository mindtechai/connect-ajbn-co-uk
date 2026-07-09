import { Link } from "react-router-dom";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";
import impactLionsLogo from "@/assets/impact-lions-logo.png.asset.json";
import { assetUrl } from "@/lib/asset";
import { DeveloperCredit } from "@/components/DeveloperCredit";
import { ContactCards } from "@/components/landing/ContactCards";

export function Footer() {
  return (
    <footer id="contact" className="py-12 bg-card border-t">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center flex-wrap gap-3 mb-3">
              <img src={assetUrl(ajbnLogo)} alt="Asian Jewish Business Network logo" className="h-12 w-12 md:h-14 md:w-14 rounded-lg object-cover shadow-md ring-2 ring-gold/60 shrink-0" />
              <p className="font-display text-base sm:text-lg md:text-xl font-bold text-primary">Asian Jewish Business Network</p>
              <img src={assetUrl(impactLionsLogo)} alt="AJBN Impact Lions Club logo" className="h-16 w-16 md:h-20 md:w-20 object-contain shrink-0" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Asian Jewish Business Network — empowering business, connecting communities across the UK.
            </p>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Quick Links</p>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/events" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Events</Link>
              <Link to="/lions" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Impact Lions</Link>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            </div>
          </div>
          <div className="md:col-span-2">
            <p className="font-semibold text-sm mb-3">Contact Us</p>
            <ContactCards />
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center">
          <div className="mb-2">
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
              Privacy Policy
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Asian Jewish Business Network. All rights reserved.
          </p>
          <DeveloperCredit className="mt-2" />
        </div>
      </div>
    </footer>
  );
}
