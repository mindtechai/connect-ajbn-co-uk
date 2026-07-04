import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";

export function Footer() {
  return (
    <footer className="py-12 bg-card border-t">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src={ajbnLogo.url} alt="AJBN" className="h-9 w-9 rounded-md object-cover" />
              <p className="font-display text-lg font-bold text-primary">AJBN</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Asian Jewish Business Network — connecting communities, empowering business across the UK.
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
