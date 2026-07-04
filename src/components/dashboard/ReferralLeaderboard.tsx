import { ScrollReveal } from "@/components/ScrollReveal";
import { Trophy, TrendingUp, Crown, Award, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Row = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  referral_count: number;
  is_lion: boolean;
};

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
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("referral_leaderboard", { _limit: 10 });
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="bg-card rounded-xl border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-muted-foreground" />
          <h3 className="text-sm font-semibold">Referral Leaderboard</h3>
        </div>
        <span className="text-xs text-muted-foreground">All time</span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[1.5rem_1fr_3rem] gap-2 px-3 mb-2">
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">#</span>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Member</span>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider text-center">Refs</span>
      </div>

      {loading ? (
        <div className="py-8 flex justify-center"><Loader2 size={16} className="animate-spin text-muted-foreground" /></div>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-xs text-muted-foreground">No referrals recorded yet — share your code to appear here.</p>
      ) : (
        <div className="space-y-1.5">
          {rows.map((m, i) => {
            const rank = i + 1;
            const name = [m.first_name, m.last_name].filter(Boolean).join(" ") || "Member";
            const isMe = user?.id === m.user_id;
            return (
              <ScrollReveal key={m.user_id} delay={i * 40}>
                <div
                  className={`grid grid-cols-[1.5rem_1fr_3rem] gap-2 items-center rounded-lg px-3 py-2.5 transition-colors ${
                    isMe
                      ? "bg-primary/5 border border-primary/15 ring-1 ring-primary/10"
                      : rankStyles[rank] || "hover:bg-muted/40"
                  } ${rankStyles[rank] ? "border" : ""}`}
                >
                  <div className="flex items-center justify-center">
                    {rankIcons[rank] || <span className="text-xs text-muted-foreground font-medium tabular-nums">{rank}</span>}
                  </div>
                  <div className="min-w-0">
                    <span className={`text-sm truncate ${isMe ? "font-semibold text-primary" : "font-medium"}`}>
                      {name}{isMe && <span className="text-[10px] text-primary/60 ml-1">(you)</span>}
                    </span>
                    {m.company && <p className="text-[10px] text-muted-foreground truncate">{m.company}</p>}
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold tabular-nums">{m.referral_count}</span>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}

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
