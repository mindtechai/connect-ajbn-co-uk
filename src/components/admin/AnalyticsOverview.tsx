import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardCounts, getSignupSeries, getActivityFeed, type ActivityItem } from "@/lib/admin-dashboard.functions";
import { Users, UserCheck, UserPlus, Ban, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { Link } from "@/lib/router-compat";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

const typeIcons: Record<ActivityItem["type"], typeof Users> = {
  signup: UserPlus,
  need: TrendingUp,
  offer: TrendingUp,
  intro: UserCheck,
  enquiry: AlertCircle,
  report: AlertCircle,
};

const typeLabels: Record<ActivityItem["type"], string> = {
  signup: "New sign-up",
  need: "Need",
  offer: "Offer",
  intro: "Intro request",
  enquiry: "Enquiry",
  report: "Report",
};

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

interface Props {
  pendingCount: number;
}

export function AnalyticsOverview({ pendingCount }: Props) {
  const fetchCounts = useServerFn(getDashboardCounts);
  const fetchSeries = useServerFn(getSignupSeries);
  const fetchFeed = useServerFn(getActivityFeed);

  const [counts, setCounts] = useState<Awaited<ReturnType<typeof fetchCounts>> | null>(null);
  const [series, setSeries] = useState<Awaited<ReturnType<typeof fetchSeries>>>([]);
  const [feed, setFeed] = useState<Awaited<ReturnType<typeof fetchFeed>>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [c, s, f] = await Promise.all([
        fetchCounts(),
        fetchSeries(),
        fetchFeed(),
      ]);
      setCounts(c);
      setSeries(s);
      setFeed(f);
    } catch (e: any) {
      setError(e?.message || "Could not load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Keep the live pending badge in sync with the realtime counter in AdminPage.
  useEffect(() => {
    setCounts((prev) => (prev ? { ...prev, pending: pendingCount } : prev));
  }, [pendingCount]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
        <Loader2 className="animate-spin" size={28} />
        <p className="text-sm">Loading dashboard…</p>
      </div>
    );
  }

  if (error || !counts) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-destructive">
        <p className="font-medium">Dashboard unavailable</p>
        <p className="text-sm mt-1">{error || "Unknown error"}</p>
        <button onClick={load} className="mt-3 text-sm underline">Retry</button>
      </div>
    );
  }

  const newestPendingText = counts.newestPending
    ? `${counts.newestPending.name}${counts.newestPending.company ? ` — ${counts.newestPending.company}` : ""}`
    : "No pending approvals";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Live AJBN network overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Members"
          value={counts.total}
          icon={Users}
          href="/admin/members"
        />
        <MetricCard
          label="Pending Approval"
          value={counts.pending}
          icon={UserPlus}
          href="/admin/members?filter=pending"
          sub={newestPendingText}
          highlight={counts.pending > 0}
        />
        <MetricCard
          label="Approved"
          value={counts.approved}
          icon={UserCheck}
          href="/admin/members"
        />
        <MetricCard
          label="Blocked"
          value={counts.blocks}
          icon={Ban}
          href="/admin/blocks"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="New sign-ups (24h)" value={counts.new24h} icon={TrendingUp} />
        <MetricCard label="New sign-ups (7d)" value={counts.new7d} icon={TrendingUp} />
      </div>

      {/* Chart + Activity */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-card rounded-xl border p-5 shadow-xs">
          <h3 className="text-sm font-semibold mb-4">Sign-ups over the last 30 days</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="signupGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(v) => new Date(v).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  tick={{ fontSize: 11 }}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  labelFormatter={(v) => new Date(v as string).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(var(--primary))"
                  fill="url(#signupGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border p-5 shadow-xs flex flex-col">
          <h3 className="text-sm font-semibold mb-4">Live activity feed</h3>
          <div className="flex-1 overflow-y-auto max-h-96 space-y-3 pr-1">
            {feed.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">No activity in the last 30 days.</p>
            )}
            {feed.map((item) => {
              const Icon = typeIcons[item.type];
              return (
                <Link
                  key={item.id}
                  to={item.link}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors group"
                >
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{typeLabels[item.type]}</p>
                    <p className="text-sm font-medium line-clamp-1 group-hover:underline">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.name}{item.company ? ` · ${item.company}` : ""} · {formatDateShort(item.date)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  href,
  sub,
  highlight,
}: {
  label: string;
  value: number;
  icon: typeof Users;
  href?: string;
  sub?: string;
  highlight?: boolean;
}) {
  const content = (
    <div className={cn(
      "bg-card rounded-xl border p-4 shadow-xs transition-colors",
      href && "hover:border-primary/50 cursor-pointer"
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={cn("text-primary", highlight && "text-amber-500")} />
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <p className={cn("text-2xl font-bold tabular-nums", highlight && "text-amber-600 dark:text-amber-400")}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1 truncate">{sub}</p>}
    </div>
  );

  if (href) return <Link to={href}>{content}</Link>;
  return content;
}
