import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServiceEnquiryDialog } from "@/components/services/ServiceEnquiryDialog";
import { Handshake, Scale, Gift, Code2 } from "lucide-react";

const SERVICES = [
  {
    icon: Handshake,
    title: "Capital & Deal Matching",
    tagline: "Bridging the gap between projects and funding.",
    description:
      "Connecting vetted property developers with active private and institutional capital. Submit your transaction parameters directly to our Capital Connect desk for targeted matching.",
    cta: "Submit a Deal",
  },
  {
    icon: Scale,
    title: "Professional Advisory Connect",
    tagline: "Transaction-ready legal and financial expertise.",
    description:
      "Direct access to our inner circle of network-verified Solicitors, Accountants, and IFAs specifically chosen to structure, secure, and complete high-value transactions safely.",
    cta: "Connect with an Advisor",
  },
  {
    icon: Gift,
    title: "Referral Incentives Marketplace",
    tagline: "Monetise your introductions.",
    description:
      "Introduce a high-value client, property developer, or finance provider to the network and earn structured referral fees or commission splits upon successful deal closure.",
    cta: "Enquire About Rewards",
  },
  {
    icon: Code2,
    title: "Member-Exclusive Tech Builds",
    tagline: "Accelerate your business into the digital space.",
    description:
      "Need a custom web app, client portal, or modern digital platform for your venture? Access rapid, AI-assisted prototype and production builds at exclusive, member-only corporate rates.",
    cta: "Request Tech Consultation",
  },
];

export default function ServicesPage() {
  const [open, setOpen] = useState(false);
  const [serviceType, setServiceType] = useState("");
  const location = useLocation();

  const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [location.hash]);

  const openFor = (title: string) => {
    setServiceType(title);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="relative pt-32 pb-16 bg-hero-pattern overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <ScrollReveal>
            <p className="text-primary-foreground/70 text-xs md:text-sm tracking-[0.2em] uppercase mb-4">
              Added Value Services
            </p>
          </ScrollReveal>
          <ScrollReveal delay={80}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-[1.05] mb-6">
              Concierge <span className="text-gradient-gold">Services</span> for the Network
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={160}>
            <p className="text-primary-foreground/75 text-lg md:text-xl leading-relaxed max-w-2xl">
              Curated services built around our members — capital, advisory, referral rewards
              and technology, delivered by trusted specialists inside the AJBN network.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 flex-1">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-6">
            {SERVICES.map((s, i) => (
              <ScrollReveal key={s.title} delay={i * 60}>
                <div id={slug(s.title)} className="scroll-mt-24">
                <ServiceCard
                  icon={s.icon}
                  title={s.title}
                  tagline={s.tagline}
                  description={s.description}
                  cta={s.cta}
                  onClick={() => openFor(s.title)}
                />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <ServiceEnquiryDialog open={open} onOpenChange={setOpen} serviceType={serviceType} />

      <Footer />
    </div>
  );
}