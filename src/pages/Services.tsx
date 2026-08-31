import { useEffect, useState } from "react";
import { useLocation, Link } from "@/lib/router-compat";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServiceEnquiryDialog } from "@/components/services/ServiceEnquiryDialog";
import { Handshake, Scale, Gift, Code2 } from "lucide-react";

const SERVICES = [
  {
    icon: Handshake,
    title: "Capital Connect",
    tagline:
      "A member networking initiative connecting AJBN members with relevant business and professional connections across the wider AJBN network.",
    description:
      "Where a member identifies a business need, AJBN may identify a relevant professional or business connection within its network and, at the member's request, facilitate an introduction. The parties communicate and contract independently. AJBN does not provide financial advice, recommend financial products or negotiate transactions.",
    cta: "Request an Introduction",
  },
  {
    icon: Scale,
    title: "Professional Advisory Connect",
    tagline: "Introductions to professional advisers within the network.",
    description:
      "Members can ask to be introduced to network solicitors, accountants, surveyors, architects, capital allowances specialists and other professional advisers. Any engagement is agreed directly between the parties.",
    cta: "Connect with an Advisor",
  },
  {
    icon: Gift,
    title: "Membership Referral Programme",
    tagline: "Introduce businesses and professionals to AJBN.",
    description:
      "Members can introduce prospective businesses and professionals to AJBN membership and may receive membership renewal credit or another membership referral benefit. This is a membership referral programme, not a transaction referral programme.",
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
              Curated services built around our members — business and professional
              introductions, advisory connections, membership referral rewards and technology,
              delivered by specialists inside the multidisciplinary AJBN network.

            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-20 flex-1" aria-labelledby="services-list-heading">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <h2
            id="services-list-heading"
            className="text-2xl md:text-3xl font-display font-bold text-primary mb-8"
          >
            Added value services for members
          </h2>
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

      <section className="pb-20" aria-labelledby="capital-connect-heading">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl border-t pt-12">
          <h2
            id="capital-connect-heading"
            className="text-2xl md:text-3xl font-display font-bold text-primary mb-4"
          >
            How AJBN Capital Connect works
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            Capital Connect is AJBN's member networking and business/professional introduction
            initiative. A member identifies a business need; AJBN may identify a relevant
            professional or business connection within its network; and, at the member's request,
            AJBN may facilitate an introduction. The parties then communicate and contract
            independently. The wider AJBN network spans solicitors and barristers, accountants and
            tax advisers, architects, surveyors, capital allowances specialists, property and
            construction professionals, technology and marketing businesses, business advisers and
            other professional and commercial services. AJBN does not provide financial advice,
            recommend financial products or negotiate transactions.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-3xl">
            To ask for a connection,{" "}
            <Link to="/contact" className="text-teal hover:underline">
              contact the AJBN team to request an introduction
            </Link>
            .
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed max-w-3xl">

            Capital Connect sits alongside the rest of the network:{" "}
            <Link to="/events" className="text-teal hover:underline">
              AJBN networking events in London
            </Link>{" "}
            are where most introductions start,{" "}
            <Link to="/referral-rewards" className="text-teal hover:underline">
              referral rewards and membership tiers
            </Link>{" "}
            recognise members who introduce business,{" "}
            <Link to="/sponsors-partners" className="text-teal hover:underline">
              sponsors and partners
            </Link>{" "}
            support the programme, and the{" "}
            <Link to="/lions" className="text-teal hover:underline">
              AJBN Impact Lions Club
            </Link>{" "}
            channels surplus into charitable work. Access is for members —{" "}
            <Link to="/register" className="text-teal hover:underline">
              apply to join AJBN Connect
            </Link>
            .
          </p>
        </div>
      </section>

      <ServiceEnquiryDialog open={open} onOpenChange={setOpen} serviceType={serviceType} />

      <Footer />
    </div>
  );
}