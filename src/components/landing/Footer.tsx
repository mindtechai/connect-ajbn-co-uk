import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";
import impactLionsLogo from "@/assets/impact-lions-logo.png.asset.json";
import { assetUrl } from "@/lib/asset";

export function Footer() {
  return (
    <footer className="py-12 bg-card border-t">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center flex-wrap gap-3 mb-3">
              <img src={assetUrl(ajbnLogo)} alt="Asian Jewish Business Network logo" className="h-12 w-12 md:h-14 md:w-14 rounded-lg object-cover shadow-md ring-2 ring-gold/60 shrink-0" />
              <p className="font-display text-base sm:text-lg md:text-xl font-bold text-primary">Asian Jewish Business Network</p>
              <img src={assetUrl(impactLionsLogo)} alt="AJBN Impact Lions Club logo" className="h-12 w-12 md:h-14 md:w-14 object-contain shrink-0" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Asian Jewish Business Network — empowering business, connecting communities across the UK.
            </p>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Quick Links</p>
            <div className="flex flex-col gap-2">
              {["About", "Events", "Impact Lions", "Contact"].map((link) => (
                <a key={link} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {link}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm mb-3">Contact</p>
            <p className="text-sm text-muted-foreground">info@ajbn.co.uk</p>
            <p className="text-sm text-muted-foreground">London, United Kingdom</p>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Asian Jewish Business Network. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
