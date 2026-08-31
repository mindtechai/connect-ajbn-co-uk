import { Link } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Handshake, Users, Trophy, ArrowRight } from "lucide-react";

const items = [
  {
    icon: Handshake,
    title: "Capital Connect",
    body: "Ask AJBN for a relevant business or professional introduction within the network. The parties communicate and contract independently.",
  },
  {
    icon: Users,
    title: "Membership referrals",
    body: "Share your AJBN referral code. Approved membership introductions earn renewal credit — your referral gets a first-year discount.",
  },
  {
    icon: Trophy,
    title: "Tiers & leaderboard",
    body: "Connector · Ambassador · Chair's Circle. Progress tracked in your dashboard, celebrated at flagship events.",
  },
];


export function ReferralRewardsSection() {
  return (
    <section id="referral-rewards" className="py-24 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-2xl mb-12">
          <ScrollReveal>
            <p className="text-sm tracking-widest uppercase text-gold font-semibold mb-3">
              Members Referral Rewards
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Grow the network. Get rewarded.
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              AJBN runs on introductions — relevant business and professional connections inside
              the network, and new members brought in by existing ones.
            </p>

          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {items.map((it, i) => (
            <ScrollReveal key={it.title} delay={i * 80}>
              <div className="h-full rounded-xl border bg-card p-6 shadow-xs hover:shadow-md transition-shadow">
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
          <Link to="/referral-rewards">
            <Button variant="default" size="lg">
              See how referral rewards work
              <ArrowRight className="ml-2" size={16} />
            </Button>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
