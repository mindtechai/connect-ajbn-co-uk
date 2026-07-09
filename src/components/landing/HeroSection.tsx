import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import heroImage from "@/assets/hero-networking.jpg";
import { ArrowRight, MessageCircle } from "lucide-react";

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
            <p className="text-primary-foreground/70 font-body text-xs md:text-sm tracking-[0.2em] uppercase leading-relaxed mb-4 md:mb-5 max-w-xl">
              The UK's only network dedicated to strengthening professional ties between Asian and Jewish business communities.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={80}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-[1.05] mb-6 md:mb-7">
              Empowering Business.{" "}
              <span className="text-gradient-gold">Connecting Communities.</span>
            </h1>
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
              <Link to="/referral-rewards">
                <Button variant="heroOutline" size="xl">
                  Members Referral Rewards
                  <ArrowRight className="ml-2" size={18} />
                </Button>
              </Link>
              <Button
                variant="teal"
                size="xl"
                onClick={() =>
                  document
                    .getElementById("messaging")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                Direct Member Messaging
                <MessageCircle className="ml-2" size={18} />
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Vertical right-side tag — desktop only */}
      <Link
        to="/referral-rewards"
        aria-label="Members Referral Rewards"
        className="hidden lg:flex absolute right-6 xl:right-10 top-1/2 -translate-y-1/2 z-20 items-center gap-3 rotate-90 origin-right group"
      >
        <span className="h-px w-10 bg-gold/70 group-hover:w-14 transition-all" />
        <span className="text-xs xl:text-sm tracking-[0.32em] uppercase font-semibold text-gold whitespace-nowrap">
          Members Referral Rewards
        </span>
        <ArrowRight size={14} className="text-gold" />
      </Link>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
