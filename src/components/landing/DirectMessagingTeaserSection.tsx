import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { MessageCircle, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

const items = [
  {
    icon: MessageCircle,
    title: "1-on-1 Secure Chat",
    body: "Direct member-to-member conversations routed entirely through the app — no phone or email exposed.",
  },
  {
    icon: ShieldCheck,
    title: "Contact Details Masked",
    body: "Your email address and mobile number stay 100% private. Only your professional profile is visible.",
  },
  {
    icon: Sparkles,
    title: "One-Tap Activation",
    body: "Activate your inbox from the dashboard in a single click — no separate registration, no forms.",
  },
];

export function DirectMessagingTeaserSection() {
  const scrollToGuide = () => {
    document
      .getElementById("messaging")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="direct-messaging-teaser" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-2xl mb-12">
          <ScrollReveal>
            <p className="text-sm tracking-widest uppercase text-gold font-semibold mb-3">
              Direct Member Messaging
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Connect securely. Stay private.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Connect securely 1-on-1 with property developers, finance providers, and
              corporate members. Your private contact details remain 100% masked.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {items.map((it, i) => (
            <ScrollReveal key={it.title} delay={i * 80}>
              <div className="h-full rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center mb-4">
                  <it.icon size={20} className="text-gold" />
                </div>
                <h3 className="text-lg font-display font-semibold mb-2">{it.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{it.body}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal>
          <Button variant="default" size="lg" onClick={scrollToGuide}>
            Learn More & Activate
            <ArrowRight className="ml-2" size={16} />
          </Button>
        </ScrollReveal>
      </div>
    </section>
  );
}