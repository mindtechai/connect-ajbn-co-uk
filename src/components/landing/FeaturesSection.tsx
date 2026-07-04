import { ScrollReveal } from "@/components/ScrollReveal";
import { Users, CalendarDays, Award, MessageCircle } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Member Directory",
    description: "Search and connect with professionals across finance, property, legal, tech, and more.",
  },
  {
    icon: CalendarDays,
    title: "Exclusive Events",
    description: "Flagship networking events, golf days, galas, and industry-specific roundtables.",
  },
  {
    icon: Award,
    title: "Referral Rewards",
    description: "Earn 10% off your renewal for every member you refer. Refer 5 and your membership is free.",
  },
  {
    icon: MessageCircle,
    title: "Direct Messaging",
    description: "Connect privately with fellow members, find mentors, and build lasting partnerships.",
  },
];

export function FeaturesSection() {
  return (
    <section id="why-join" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <ScrollReveal>
          <p className="text-sm tracking-widest uppercase text-teal font-medium mb-3 text-center">
            Why Join
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-4">
            Your Network Is Your Net Worth
          </h2>
          <p className="text-muted-foreground text-center max-w-lg mx-auto mb-16">
            AJBN gives you the tools and community to grow your business through meaningful relationships.
          </p>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((f, i) => (
            <ScrollReveal key={f.title} delay={i * 90}>
              <div className="group bg-card rounded-xl p-7 shadow-sm hover:shadow-md transition-shadow border">
                <div className="w-11 h-11 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <f.icon size={22} />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
