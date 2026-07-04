import { ScrollReveal } from "@/components/ScrollReveal";

const stats = [
  { value: "150+", label: "Active Corporate Members" },
  { value: "£10M+", label: "Deals Facilitated Todate" },
  { value: "50+", label: "Events Todate" },
  { value: "£87K", label: "Raised for Charity" },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-card border-b">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 80} className="text-center">
              <p className="text-3xl md:text-4xl font-display font-bold text-primary tabular-nums">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
