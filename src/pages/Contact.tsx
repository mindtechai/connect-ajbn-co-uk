import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ContactCards } from "@/components/landing/ContactCards";
import { ScrollReveal } from "@/components/ScrollReveal";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="relative pt-32 pb-16 bg-hero-pattern overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <ScrollReveal>
            <p className="text-primary-foreground/70 text-xs md:text-sm tracking-[0.2em] uppercase mb-4">
              Get in touch
            </p>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-[1.05] mb-6">
              Contact <span className="text-gradient-gold">Us</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={160}>
            <p className="text-primary-foreground/75 text-lg md:text-xl leading-relaxed max-w-2xl">
              Reach out to the right AJBN lead for your enquiry. Members,
              prospects, sponsors and partners can all find the correct
              point of contact below.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 flex-1">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <ScrollReveal>
            <ContactCards />
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
