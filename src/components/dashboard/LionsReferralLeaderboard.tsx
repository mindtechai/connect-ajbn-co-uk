import { ScrollReveal } from "@/components/ScrollReveal";
import { Crown, Award, Loader2 } from "lucide-react";
import lionsBadge from "@/assets/lions-badge.png";
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
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.rpc("referral_leaderboard", { _limit: 30 });
      setRows(((data ?? []) as Row[]).filter((r) => r.is_lion).slice(0, 10));
      setLoading(false);
    })();
  }, []);

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

      {loading ? (
        <div className="py-8 flex justify-center"><Loader2 size={16} className="animate-spin text-muted-foreground" /></div>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-xs text-muted-foreground">No Lions referrals recorded yet.</p>
      ) : (
        <div className="space-y-1.5">
          {rows.map((m, i) => {
            const rank = i + 1;
            const name = [m.first_name, m.last_name].filter(Boolean).join(" ") || "Lion";
            const isMe = user?.id === m.user_id;
            const credit = Math.min(Number(m.referral_count) * 50, 250);
            return (
              <ScrollReveal key={m.user_id} delay={i * 40}>
                <div
                  className={`grid grid-cols-[1.5rem_1fr_3rem_3.5rem] gap-2 items-center rounded-lg px-3 py-2.5 transition-colors ${
                    isMe
                      ? "bg-gold/5 border border-gold/20 ring-1 ring-gold/10"
                      : rankStyles[rank] || "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    {rankIcons[rank] || <span className="text-xs text-muted-foreground font-medium tabular-nums">{rank}</span>}
                  </div>
                  <div className="min-w-0">
                    <span className={`text-sm ${isMe ? "font-semibold text-gold" : "font-medium"}`}>
                      {name}{isMe && <span className="text-[10px] text-gold/60 ml-1">(you)</span>}
                    </span>
                    {m.company && <p className="text-[10px] text-muted-foreground truncate">{m.company}</p>}
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold tabular-nums">{m.referral_count}</span>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-bold tabular-nums text-gold">£{credit}</span>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      )}

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
