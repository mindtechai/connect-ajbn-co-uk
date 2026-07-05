import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useAuth } from "@/hooks/useAuth";
import impactLionsLogo from "@/assets/impact-lions-logo.png.asset.json";
import { assetUrl } from "@/lib/asset";
import { Heart, BarChart3, Trophy, Crown, ArrowRight, HandHeart } from "lucide-react";

const benefits = [
  { icon: Heart, text: "Fund designated UK charities through curated events" },
  { icon: BarChart3, text: "ESG governance reports for corporate compliance" },
  { icon: Trophy, text: "Exclusive charity golf days, galas & challenges" },
];

const contributions = [
  {
    icon: HandHeart,
    title: "£250/year membership",
    body: "Every Impact Lion contributes £250 annually. This funds the club's charitable activities and event logistics.",
  },
  {
    icon: Crown,
    title: "Member-governed",
    body: "A dedicated committee selects the charities and approves event budgets, ensuring every pound is aligned with AJBN values.",
  },
  {
    icon: BarChart3,
    title: "ESG credentials",
    body: "Corporate members receive an annual ESG impact report that can be used for compliance and sustainability disclosures.",
  },
];

export default function LionsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-32 pb-20 bg-hero-pattern overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <ScrollReveal>
                <p className="text-primary-foreground/70 text-xs md:text-sm tracking-[0.2em] uppercase mb-4">
                  Charitable Arm of AJBN
                </p>
              </ScrollReveal>
              <ScrollReveal delay={80}>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-[1.05] mb-6">
                  AJBN Impact <span className="text-gradient-gold">Lions Club</span>
                </h1>
              </ScrollReveal>
              <ScrollReveal delay={160}>
                <p className="text-primary-foreground/75 text-lg md:text-xl leading-relaxed max-w-xl">
                  A separate charitable division within AJBN. Members contribute to fund community
                  initiatives, ESG projects and event fundraising — while earning ESG credentials
                  for their business.
                </p>
              </ScrollReveal>
              <ScrollReveal delay={240}>
                <div className="flex flex-wrap gap-4 mt-8">
                  <Link to={user ? "/lions/apply" : "/register?next=/lions/apply"}>
                    <Button variant="gold" size="xl">
                      <Crown className="mr-2" size={18} />
                      Join for £250/year
                    </Button>
                  </Link>
                  <a href="#how-it-works">
                    <Button variant="heroOutline" size="xl">
                      Learn more
                      <ArrowRight className="ml-2" size={18} />
                    </Button>
                  </a>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal direction="left" className="order-1 lg:order-2">
              <div className="relative flex justify-center">
                <img
                  src={assetUrl(impactLionsLogo)}
                  alt="AJBN Impact Lions Club"
                  className="w-56 h-56 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain drop-shadow-2xl"
                />
                <div className="absolute inset-0 -m-4 rounded-full border-2 border-gold/20" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-muted/40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-sm tracking-widest uppercase text-gold font-semibold mb-3">
              What you get
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Impact, governance & community
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Impact Lions Club membership is open to approved AJBN members. It combines
              fundraising with structured ESG reporting and exclusive charitable events.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((b, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="h-full rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center mb-4">
                    <b.icon size={20} className="text-gold" />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {contributions.map((c, i) => (
              <ScrollReveal key={c.title} delay={i * 80}>
                <div className="h-full rounded-xl border bg-card p-6 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center mb-4">
                    <c.icon size={20} className="text-gold" />
                  </div>
                  <h3 className="text-lg font-display font-semibold mb-2">{c.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{c.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/40">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Ready to become an Impact Lion?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Membership requires an active AJBN membership. Apply below and the committee will
              review your application.
            </p>
            <Link to={user ? "/lions/apply" : "/register?next=/lions/apply"}>
              <Button variant="gold" size="xl">
                <Crown className="mr-2" size={18} />
                Join Impact Lions Club
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
