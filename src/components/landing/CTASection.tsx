import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-24 bg-hero-pattern relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
            Member's Executive Referral Network
          </h2>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto mb-8">
            Grow our community with trusted peers. As an exclusive, member-only ecosystem, new access is granted primarily through internal network introductions. Refer a fellow business leader or corporate partner to invite them into the AJBN Connect portal.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button variant="hero" size="xl">Apply for Membership</Button>
            </Link>
            <Link to="/login">
              <Button variant="heroOutline" size="xl">Member Sign In</Button>
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
