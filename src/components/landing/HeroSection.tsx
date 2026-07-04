import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import heroImage from "@/assets/hero-networking.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center bg-hero-pattern overflow-hidden">
      {/* Background image overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="AJBN networking event"
          className="w-full h-full object-cover opacity-15"
          loading="eager"
        />
        <div className="absolute inset-0 bg-hero-pattern opacity-80" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10 pt-24 pb-16">
        <div className="max-w-2xl">
          <ScrollReveal>
            <p className="text-primary-foreground/60 font-body text-sm tracking-widest uppercase mb-4">
              Asian Jewish Business Network
            </p>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-[1.08] mb-6">
              Empowering Business.{" "}
              <span className="text-gradient-gold">Connecting Communities.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={160}>
            <p className="text-primary-foreground/70 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
              The UK's only network dedicated to strengthening professional ties between Asian and Jewish business communities.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={240}>
            <div className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button variant="hero" size="xl">
                  Apply for Membership
                </Button>
              </Link>
              <a href="#about">
                <Button variant="heroOutline" size="xl">
                  Learn More
                </Button>
              </a>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
