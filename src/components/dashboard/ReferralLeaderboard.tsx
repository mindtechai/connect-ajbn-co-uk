import { ScrollReveal } from "@/components/ScrollReveal";
import { Trophy, TrendingUp, Crown, Award } from "lucide-react";

const leaderboardData = [
  { rank: 1, name: "Priya Lieberman", referrals: 12, qualified: 9, badge: "Super Connector" },
  { rank: 2, name: "Arjun Goldberg", referrals: 10, qualified: 8, badge: "Super Connector" },
  { rank: 3, name: "Samir Cohen", referrals: 8, qualified: 6, badge: "Top Referrer" },
  { rank: 4, name: "Anita Rosen", referrals: 7, qualified: 5, badge: null },
  { rank: 5, name: "Vikram Levy", referrals: 6, qualified: 5, badge: null },
  { rank: 6, name: "Raj Goldstein", referrals: 3, qualified: 2, badge: null, isCurrentUser: true },
  { rank: 7, name: "Neha Friedman", referrals: 3, qualified: 2, badge: null },
  { rank: 8, name: "Deepak Stern", referrals: 2, qualified: 1, badge: null },
];

const rankStyles: Record<number, string> = {
  1: "bg-gold-muted border-gold/30",
  2: "bg-muted/60 border-muted-foreground/10",
  3: "bg-orange-50 border-orange-200/40",
};

const rankIcons: Record<number, React.ReactNode> = {
  1: <Crown size={16} className="text-gold" />,
  2: <Trophy size={16} className="text-muted-foreground" />,
  3: <Award size={16} className="text-orange-400" />,
};

export function ReferralLeaderboard() {
  return (
    <div className="bg-card rounded-xl border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-muted-foreground" />
          <h3 className="text-sm font-semibold">Referral Leaderboard</h3>
        </div>
        <span className="text-xs text-muted-foreground">This year</span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[2rem_1fr_3.5rem_3.5rem] gap-2 px-3 mb-2">
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">#</span>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Member</span>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider text-center">Refs</span>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider text-center">Joined</span>
      </div>

      <div className="space-y-1.5">
        {leaderboardData.map((member, i) => (
          <ScrollReveal key={member.name} delay={i * 50}>
            <div
              className={`grid grid-cols-[2rem_1fr_3.5rem_3.5rem] gap-2 items-center rounded-lg px-3 py-2.5 transition-colors ${
                member.isCurrentUser
                  ? "bg-primary/5 border border-primary/15 ring-1 ring-primary/10"
                  : rankStyles[member.rank] || "hover:bg-muted/40"
              } ${rankStyles[member.rank] ? "border" : ""}`}
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
                  <span className={`text-sm truncate ${member.isCurrentUser ? "font-semibold text-primary" : "font-medium"}`}>
                    {member.name}
                    {member.isCurrentUser && (
                      <span className="text-[10px] text-primary/60 ml-1">(you)</span>
                    )}
                  </span>
                </div>
                {member.badge && (
                  <span className="text-[10px] text-gold font-medium">{member.badge}</span>
                )}
              </div>

              {/* Referrals sent */}
              <div className="text-center">
                <span className="text-sm font-bold tabular-nums">{member.referrals}</span>
              </div>

              {/* Qualified (became members) */}
              <div className="text-center">
                <span className="text-sm font-bold tabular-nums text-teal">{member.qualified}</span>
              </div>
            </div>
          </ScrollReveal>
        ))}
      </div>

      {/* Incentive reminder */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-start gap-2 bg-muted/50 rounded-lg px-3 py-2.5">
          <Trophy size={14} className="text-gold mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium">Referral Rewards</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
              Earn 10% off for each new member referred. Refer 5 qualified members and your next renewal is <span className="font-semibold text-foreground">free</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
