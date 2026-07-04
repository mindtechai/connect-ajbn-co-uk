import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import impactLionsLogo from "@/assets/impact-lions-logo.png.asset.json";
import { assetUrl } from "@/lib/asset";
import { Heart, BarChart3, Trophy } from "lucide-react";

const benefits = [
  { icon: Heart, text: "Fund designated UK charities through curated events" },
  { icon: BarChart3, text: "ESG governance reports for corporate compliance" },
  { icon: Trophy, text: "Exclusive charity golf days, galas & challenges" },
];

export function ImpactLionsSection() {
  return (
    <section id="impact-lions" className="py-24 bg-muted/50 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <ScrollReveal direction="left">
            <div className="flex justify-center lg:justify-start">
              <div className="relative">
                <img
                  src={assetUrl(impactLionsLogo)}
                  alt="AJBN Impact Lions Club"
                  className="w-64 h-64 md:w-80 md:h-80 object-contain drop-shadow-xl"
                />
                <div className="absolute inset-0 -m-3 rounded-full border-2 border-gold/15" />
              </div>
            </div>
          </ScrollReveal>

          <div>
            <ScrollReveal direction="right">
              <p className="text-sm tracking-widest uppercase text-gold font-semibold mb-3">
                Charitable Arm
              </p>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                AJBN Impact Lions Club
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8 max-w-lg">
                A separate charitable division within AJBN. As an Impact Lion, you participate
                in fundraising events where all surplus funds go directly to designated UK charities —
                while earning ESG credentials for your business.
              </p>
            </ScrollReveal>

            <div className="space-y-4 mb-8">
              {benefits.map((b, i) => (
                <ScrollReveal key={i} delay={i * 80} direction="right">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-md bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                      <b.icon size={16} className="text-gold" />
                    </div>
                    <p className="text-sm text-foreground">{b.text}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            <ScrollReveal delay={300} direction="right">
              <div className="flex items-center gap-4 flex-wrap">
                <Link to="/register">
                  <Button variant="gold" size="lg">
                    Join for £250/year
                  </Button>
                </Link>
                <span className="text-xs text-muted-foreground">
                  Requires active AJBN membership
                </span>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
