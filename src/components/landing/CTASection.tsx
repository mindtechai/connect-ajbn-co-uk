import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-24 bg-hero-pattern relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
            Ready to Grow Your Network?
          </h2>
          <p className="text-primary-foreground/70 max-w-md mx-auto mb-8">
            Join a community where relationships turn into real business. Apply today or get referred by a current member.
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
