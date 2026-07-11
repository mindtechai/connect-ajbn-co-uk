import { useEffect, useRef, useState } from "react";
import { TrendingUp } from "lucide-react";
import { totals, DEMO_DEALS_EVENT } from "@/lib/demoDeals";

const fmt = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

export function NetworkTicker({ refreshKey = 0 }: { refreshKey?: number }) {
  const [target, setTarget] = useState(0);
  const [count, setCount] = useState(0);
  const [display, setDisplay] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const load = () => {
      const t = totals();
      setTarget(t.total_deal_value_gbp);
      setCount(t.deal_count);
    };
    load();
    const handler = () => load();
    window.addEventListener(DEMO_DEALS_EVENT, handler);
    return () => window.removeEventListener(DEMO_DEALS_EVENT, handler);
  }, [refreshKey]);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const start = display;
    const delta = target - start;
    const duration = 900;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(start + delta * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return (
    <div className="relative overflow-hidden rounded-xl border bg-navy-gradient text-white shadow-sm px-5 py-4 md:px-6 md:py-5">
      <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-gold blur-3xl" />
      </div>
      <div className="relative flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-white/70 flex items-center gap-1.5">
            <TrendingUp size={12} className="text-gold" />
            Total Capital & Deal Value Swapped in Network
          </p>
          <p className="font-display text-2xl md:text-3xl font-bold text-gold tabular-nums mt-1">
            {fmt.format(display)}
          </p>
          <p className="text-xs text-white/70 mt-0.5">Across {count} logged transaction{count === 1 ? "" : "s"}</p>
        </div>
      </div>
    </div>
  );
}