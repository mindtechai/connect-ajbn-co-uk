import { ScrollReveal } from "@/components/ScrollReveal";
import { Crown, Award } from "lucide-react";
import lionsBadge from "@/assets/lions-badge.png";

const lionsLeaderboardData = [
  { rank: 1, name: "Samir Cohen", recruited: 5, credit: 250, badge: "Impact Leader" },
  { rank: 2, name: "Priya Lieberman", recruited: 4, credit: 200, badge: "Impact Leader" },
  { rank: 3, name: "Arjun Goldberg", recruited: 3, credit: 150, badge: "Charity Champion" },
  { rank: 4, name: "Anita Rosen", recruited: 2, credit: 100, badge: null },
  { rank: 5, name: "Vikram Levy", recruited: 1, credit: 50, badge: null },
  { rank: 6, name: "Raj Goldstein", recruited: 0, credit: 0, badge: null, isCurrentUser: true },
];

const rankStyles: Record<number, string> = {
  1: "bg-gold-muted border-gold/30 border",
  2: "bg-gold-muted/50 border-gold/15 border",
  3: "bg-gold-muted/30 border-gold/10 border",
};

const rankIcons: Record<number, React.ReactNode> = {
  1: <Crown size={16} className="text-gold" />,
  2: <Award size={16} className="text-gold-light" />,
  3: <Award size={16} className="text-gold-light/70" />,
};

export function LionsReferralLeaderboard() {
  return (
    <div className="bg-card rounded-xl border border-gold/20 p-5 shadow-sm">
      {/* Header with Lions badge */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <img src={lionsBadge} alt="Impact Lions" className="w-7 h-7 object-contain" />
          <div>
            <h3 className="text-sm font-semibold">Impact Lions Referrals</h3>
            <p className="text-[10px] text-muted-foreground">£50 credit per recruit</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">This year</span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1.5rem_1fr_3rem_3.5rem] gap-2 px-3 mb-2">
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">#</span>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Member</span>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider text-center">New</span>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider text-center">Credit</span>
      </div>

      <div className="space-y-1.5">
        {lionsLeaderboardData.map((member, i) => (
          <ScrollReveal key={member.name} delay={i * 50}>
            <div
              className={`grid grid-cols-[1.5rem_1fr_3rem_3.5rem] gap-2 items-center rounded-lg px-3 py-2.5 transition-colors ${
                member.isCurrentUser
                  ? "bg-gold/5 border border-gold/20 ring-1 ring-gold/10"
                  : rankStyles[member.rank] || "hover:bg-muted/40"
              }`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center">
                {rankIcons[member.rank] || (
                  <span className="text-xs text-muted-foreground font-medium tabular-nums">
                    {member.rank}
                  </span>
                )}
              </div>

              {/* Name + badge */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm ${member.isCurrentUser ? "font-semibold text-gold" : "font-medium"}`}>
                    {member.name}
                    {member.isCurrentUser && (
                      <span className="text-[10px] text-gold/60 ml-1">(you)</span>
                    )}
                  </span>
                </div>
                {member.badge && (
                  <span className="text-[10px] text-gold font-medium">{member.badge}</span>
                )}
              </div>

              {/* Lions recruited */}
              <div className="text-center">
                <span className="text-sm font-bold tabular-nums">{member.recruited}</span>
              </div>

              {/* Credit earned */}
              <div className="text-center">
                <span className="text-sm font-bold tabular-nums text-gold">
                  £{member.credit}
                </span>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Incentive reminder */}
      <div className="mt-4 pt-4 border-t border-gold/10">
        <div className="flex items-start gap-2 bg-gold-muted/40 rounded-lg px-3 py-2.5">
          <Crown size={14} className="text-gold mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium">Impact Lions Rewards</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
              Earn <span className="font-semibold text-foreground">£50 off</span> your next Impact Lions renewal for each new member you recruit. Max discount: £250 (full membership).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
