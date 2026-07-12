import { ScrollReveal } from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { MessageCircle, LogIn, Inbox, Send, ArrowRight, ShieldCheck, LayoutDashboard } from "lucide-react";

const steps = [
  {
    icon: LogIn,
    title: "Log In / Register",
    description:
      "Access your secure AJBN Connect portal.",
  },
  {
    icon: Inbox,
    title: "Activate Your Inbox",
    description:
      'Tap the "Activate My Chat Inbox" card on your dashboard to securely opt-in (your phone number and email remain completely hidden).',
  },
  {
    icon: Send,
    title: "Start Connecting",
    description:
      'Browse the verified Member Directory and click the "Send Message" icon to open an instant, secure chat.',
  },
];

export function DirectMessagingPublicSection() {
  return (
    <section id="messaging" className="py-24 bg-hero-pattern relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-teal blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full bg-gold blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-teal mb-3">
                <MessageCircle size={14} />
                Member Messaging
              </span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-4">
                Secure, Private Peer-to-Peer Networking
              </h2>
              <p className="text-primary-foreground/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                Connect directly and securely with fellow members, without exposing your personal contact details
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-5 mb-10">
            {steps.map((step, i) => (
              <ScrollReveal key={step.title} delay={i * 100}>
                <div className="relative bg-primary-foreground/5 border border-primary-foreground/10 rounded-xl p-6 h-full backdrop-blur-sm hover:bg-primary-foreground/10 transition-colors">
                  <div className="absolute top-4 right-4 text-5xl font-display font-bold text-primary-foreground/5">
                    {i + 1}
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-teal/20 border border-teal/30 flex items-center justify-center mb-4">
                    <step.icon size={22} className="text-teal" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-primary-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-primary-foreground/70 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={300}>
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-primary-foreground/60">
                <ShieldCheck size={12} className="text-teal" />
                <span>
                  Your phone number and email stay private. Read our{" "}
                  <Link to="/privacy" className="underline text-teal hover:text-teal/80">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </div>
              <Link to="/login">
                <Button variant="hero" size="xl" className="gap-2">
                  Log In to Activate Messaging
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
