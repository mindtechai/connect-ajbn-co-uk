import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useAuth } from "@/hooks/useAuth";
import { MemberIntroRequests } from "@/components/referral/MemberIntroRequests";
import {
  Handshake,
  Users,
  Trophy,
  Gift,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Target,
  LineChart,
} from "lucide-react";

const capitalConnectSteps = [
  {
    icon: Target,
    title: "Members ask Salil to qualify a lead",
    body:
      "Members are free to connect directly with each other. When you want a lead formally qualified and routed, approach Salil with the opportunity brief. If the deal closes, a success fee is charged for the qualified introduction.",
  },
  {
    icon: Handshake,
    title: "Routed to the right member",
    body:
      "Qualified deals — capital raises, acquisitions, mandates, service work — are matched to members whose sector, ticket-size and geography fit.",
  },
  {
    icon: Gift,
    title: "You are rewarded on close",
    body:
      "If a Capital Connect intro converts, the introducing side (Salil or a member) receives a success reward, credited against renewals or paid per the reward schedule.",
  },
];

const memberGetMemberSteps = [
  {
    icon: Users,
    title: "Share your referral code",
    body:
      "Every member has a unique AJBN referral code in their dashboard. Share it with peers you'd trust in the room.",
  },
  {
    icon: ShieldCheck,
    title: "They apply & are vetted",
    body:
      "Your referral applies through /register using your code. Salil and the admissions team run the standard AJBN vetting.",
  },
  {
    icon: Sparkles,
    title: "You both benefit",
    body:
      "On approval and paid membership, you earn referral credit toward your next renewal (or Impact Lions add-on) and they receive a first-year introduction discount.",
  },
];

const tiers = [
  {
    name: "Connector",
    range: "1–2 referrals / year",
    perks: ["10% renewal credit per approved referral", "Recognition in member newsletter"],
  },
  {
    name: "Ambassador",
    range: "3–5 referrals / year",
    perks: [
      "25% renewal credit per approved referral",
      "Priority Capital Connect routing",
      "Reserved stand at cost at the annual flagship event held in October every year with a free half a page advert in the annual magazine",
    ],
    featured: true,
  },
  {
    name: "Chair's Circle",
    range: "6+ referrals / year",
    perks: [
      "Full renewal covered once threshold hit",
      "Complimentary Impact Lions add-on",
      "free reserved stand at the annual flagship event held in october with full page advert in the annual magazine",
      "Opportunity to become lead sponsor for the year at no cost, normally priced at £6000+vat",
    ],
  },
];

export default function ReferralRewardsPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-32 pb-16 bg-hero-pattern overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <ScrollReveal>
              <p className="text-primary-foreground/70 text-xs md:text-sm tracking-[0.2em] uppercase mb-4">
                Members-first · Capital Connect
              </p>
            </ScrollReveal>
            <ScrollReveal delay={80}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-[1.05] mb-6">
                Members Referral <span className="text-gradient-gold">Rewards</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={160}>
              <p className="text-primary-foreground/75 text-lg md:text-xl leading-relaxed max-w-2xl">
                Two ways AJBN rewards you for growing the network: passing qualified deals
                through Capital Connect, and introducing the next generation of members.
                Members are always free to connect directly with one another; Capital Connect
                is there when you want a lead qualified and routed through Salil.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={240}>
              <div className="flex flex-wrap gap-4 mt-8">
                {user ? (
                  <Link to="/dashboard">
                    <Button variant="hero" size="xl">
                      Go to my referral code
                      <ArrowRight className="ml-2" size={18} />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/login?next=/referral-rewards">
                    <Button variant="hero" size="xl">
                      Sign in to view your code
                    </Button>
                  </Link>
                )}
                <a href="#how-it-works">
                  <Button variant="heroOutline" size="xl">
                    How it works
                  </Button>
                </a>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-sm tracking-widest uppercase text-gold font-semibold mb-3">
              Track 1
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Capital Connect — qualified leads via Salil
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Members are free to make direct connections with fellow members at any time.
              Capital Connect is the route for deals you want Salil to qualify, match and
              route. On completion, a success fee applies for qualified introductions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {capitalConnectSteps.map((s, i) => (
              <ScrollReveal key={s.title} delay={i * 80}>
                <div className="h-full rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center mb-4">
                    <s.icon size={20} className="text-gold" />
                  </div>
                  <p className="text-xs font-semibold tracking-widest text-muted-foreground mb-2">
                    Step {i + 1}
                  </p>
                  <h3 className="text-lg font-display font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-sm tracking-widest uppercase text-gold font-semibold mb-3">
              Track 2
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Member-get-member introductions
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The strength of AJBN is who's in the room. Members who bring the right people
              in are recognised — and rewarded.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {memberGetMemberSteps.map((s, i) => (
              <ScrollReveal key={s.title} delay={i * 80}>
                <div className="h-full rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <s.icon size={20} className="text-primary" />
                  </div>
                  <p className="text-xs font-semibold tracking-widest text-muted-foreground mb-2">
                    Step {i + 1}
                  </p>
                  <h3 className="text-lg font-display font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-sm tracking-widest uppercase text-gold font-semibold mb-3">
              Rewards ladder
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Tiers &amp; recognition
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Rewards scale with contribution across both tracks combined. Progress is
              tracked in your dashboard; the leaderboard resets annually.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`rounded-xl border p-6 flex flex-col ${
                  t.featured
                    ? "bg-primary text-primary-foreground border-gold shadow-lg ring-1 ring-gold/40"
                    : "bg-card"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Trophy size={18} className="text-gold" />
                  <h3 className="text-xl font-display font-semibold">{t.name}</h3>
                </div>
                <p
                  className={`text-sm mb-4 ${
                    t.featured ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}
                >
                  {t.range}
                </p>
                <ul className="space-y-2 text-sm">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <span className="text-gold mt-0.5">◆</span>
                      <span
                        className={
                          t.featured ? "text-primary-foreground/90" : "text-foreground"
                        }
                      >
                        {p}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              to={user ? "/dashboard" : "/login?next=/dashboard"}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-gold transition-colors"
            >
              <LineChart size={16} />
              See your standing on the leaderboard
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm tracking-widest uppercase text-gold font-semibold mb-3">
              Members only
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Submit a referral
            </h2>

            {user ? (
              <>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Two paths, both tracked against your rewards profile:
                </p>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="rounded-xl border bg-card p-6">
                    <h3 className="font-display font-semibold mb-2">Capital Connect intro</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Send the opportunity brief (sector, ticket, timing, contact) to Salil.
                      He'll qualify and route it.
                    </p>
                    <a href="mailto:salil@ajbn.co.uk?subject=Capital%20Connect%20intro">
                      <Button variant="default" size="sm">
                        Email Salil
                        <ArrowRight className="ml-2" size={14} />
                      </Button>
                    </a>
                  </div>
                  <div className="rounded-xl border bg-card p-6">
                    <h3 className="font-display font-semibold mb-2">Refer a new member</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Grab your unique referral code from your dashboard and share it with
                      your prospect — it auto-applies at /register.
                    </p>
                    <Link to="/dashboard">
                      <Button variant="outline" size="sm">
                        Open dashboard
                        <ArrowRight className="ml-2" size={14} />
                      </Button>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-xl border bg-card p-8">
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Full referral mechanics — including your personal code, live leaderboard
                  position and the Capital Connect submission flow — are available to
                  approved AJBN members only.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link to="/login?next=/referral-rewards">
                    <Button variant="default">Sign in</Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="outline">Apply for membership</Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {user && (
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mb-10">
              <p className="text-sm tracking-widest uppercase text-gold font-semibold mb-3">
                Members only · Free
              </p>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Member-to-member introductions
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Ask for a direct introduction to another AJBN member — no success fee, no
                qualifying step. Submit the request below and track its status here.
              </p>
            </div>
            <MemberIntroRequests />
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
