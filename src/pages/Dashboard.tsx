import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  Users, CalendarDays, Award, Link2, Bell, Crown,
  Copy, ArrowRight, LogOut, Shield, Settings, User, BookUser, HeartHandshake
} from "lucide-react";
import lionsEmblem from "@/assets/lions-emblem.png";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";
import { assetUrl } from "@/lib/asset";
import { ReferralLeaderboard } from "@/components/dashboard/ReferralLeaderboard";
import { LionsReferralLeaderboard } from "@/components/dashboard/LionsReferralLeaderboard";
import { useAuth } from "@/hooks/useAuth";
import { NotificationsBell } from "@/components/NotificationsBell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type Announcement = { id: string; title: string; body: string; priority: string; published_at: string; pinned: boolean };
type UpcomingEvent = { id: string; title: string; starts_at: string; location: string | null };

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, isSuperAdmin, signOut } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: p }, { data: ann }, { data: ev }, { count }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("announcements").select("id,title,body,priority,published_at,pinned").order("pinned", { ascending: false }).order("published_at", { ascending: false }).limit(5),
        supabase.from("events").select("id,title,starts_at,location").gte("starts_at", new Date().toISOString()).order("starts_at", { ascending: true }).limit(4),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("referred_by_code", (await supabase.from("profiles").select("referral_code").eq("id", user.id).maybeSingle()).data?.referral_code ?? "__none__"),
      ]);
      setProfile(p);
      setAnnouncements(ann ?? []);
      setUpcomingEvents((ev ?? []) as UpcomingEvent[]);
      setReferralCount(count ?? 0);
    })();
  }, [user]);

  const firstName = profile?.first_name || user?.user_metadata?.first_name || (user?.email ?? "").split("@")[0];
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "—";
  const referralCode = profile?.referral_code ?? "—";
  const completion = calcCompletion(profile);

  const copyReferral = () => {
    if (!referralCode || referralCode === "—") return;
    navigator.clipboard.writeText(referralCode);
    toast({ title: "Referral code copied", description: referralCode });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={assetUrl(ajbnLogo)} alt="AJBN" className="h-8 w-8 rounded-md object-cover" />
            <span className="font-display text-lg font-bold text-primary">AJBN</span>
          </Link>
          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Shield size={14} />
                  <span className="hidden sm:inline">Admin Panel</span>
                </Button>
              </Link>
            )}
            <NotificationsBell />
            <Link
              to="/settings/profile"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Profile"
              title="Profile"
            >
              <User size={18} />
            </Link>
            <Link
              to="/settings/notifications"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Notification preferences"
              title="Notification preferences"
            >
              <Settings size={18} />
            </Link>
            <button
              onClick={async () => { await signOut(); navigate("/login"); }}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8 max-w-5xl">
        {/* Welcome */}
        <ScrollReveal>
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">
              Welcome back, {firstName}
            </h1>
            <p className="text-muted-foreground text-sm">
              Member since {memberSince}
            </p>
          </div>
        </ScrollReveal>

        {/* Quick nav */}
        <ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <Link to="/directory" className="bg-card border rounded-xl p-4 shadow-sm hover:border-primary/40 transition-colors flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 w-10 h-10 grid place-items-center"><BookUser size={18} className="text-primary" /></div>
              <div><p className="text-sm font-semibold">Member Directory</p><p className="text-xs text-muted-foreground">Search & filter by industry</p></div>
            </Link>
            <Link to="/events" className="bg-card border rounded-xl p-4 shadow-sm hover:border-primary/40 transition-colors flex items-center gap-3">
              <div className="rounded-lg bg-teal/10 w-10 h-10 grid place-items-center"><CalendarDays size={18} className="text-teal" /></div>
              <div><p className="text-sm font-semibold">Events</p><p className="text-xs text-muted-foreground">RSVP to upcoming events</p></div>
            </Link>
            <Link to="/esg" className="bg-card border rounded-xl p-4 shadow-sm hover:border-primary/40 transition-colors flex items-center gap-3">
              <div className="rounded-lg bg-gold/10 w-10 h-10 grid place-items-center"><HeartHandshake size={18} className="text-gold" /></div>
              <div><p className="text-sm font-semibold">ESG Report</p><p className="text-xs text-muted-foreground">Your social-impact summary</p></div>
            </Link>
            <Link to="/lions" className="bg-card border rounded-xl p-4 shadow-sm hover:border-gold/40 transition-colors flex items-center gap-3">
              <div className="rounded-lg bg-gold/10 w-10 h-10 grid place-items-center"><Crown size={18} className="text-gold" /></div>
              <div><p className="text-sm font-semibold">Impact Lions</p><p className="text-xs text-muted-foreground">Join the charitable arm</p></div>
            </Link>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Profile completion */}
          <ScrollReveal delay={0}>
            <DashboardCard title="Profile Completion" icon={Users}>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{completion}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-navy-gradient rounded-full transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <Link to="/settings/profile">
                  <Button variant="ghost" size="sm" className="text-xs mt-1">
                    Complete Profile <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            </DashboardCard>
          </ScrollReveal>

          {/* Referrals */}
          <ScrollReveal delay={80}>
            <DashboardCard title="My Referrals" icon={Award}>
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div>
                    <p className="text-2xl font-bold tabular-nums">{referralCount}</p>
                    <p className="text-xs text-muted-foreground">Signed up with your code</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Refer 5 members to earn a free renewal.
                </p>
                <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2">
                  <code className="text-xs flex-1 truncate">{referralCode}</code>
                  <button onClick={copyReferral} className="text-muted-foreground hover:text-foreground shrink-0">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </DashboardCard>
          </ScrollReveal>

          {/* Renewal */}
          <ScrollReveal delay={160}>
            <DashboardCard title="Renewal Status" icon={CalendarDays}>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Renewals and billing will appear here once your membership is active.
                </p>
                <Button size="sm" className="w-full" disabled>Renew Membership</Button>
              </div>
            </DashboardCard>
          </ScrollReveal>

          {/* Upcoming Events */}
          <ScrollReveal delay={240} className="md:col-span-2">
            <DashboardCard title="Upcoming Events" icon={CalendarDays}>
              <div className="space-y-3">
                {upcomingEvents.length === 0 && (
                  <p className="text-xs text-muted-foreground">No upcoming events yet.</p>
                )}
                {upcomingEvents.map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{ev.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ev.starts_at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        {ev.location && ` · ${ev.location}`}
                      </p>
                    </div>
                    <Link to="/events"><Button variant="outline" size="sm">RSVP</Button></Link>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </ScrollReveal>

          {/* Announcements */}
          <ScrollReveal delay={320}>
            <DashboardCard title="Announcements" icon={Bell}>
              <div className="space-y-3">
                {announcements.length === 0 && (
                  <p className="text-xs text-muted-foreground">No announcements right now.</p>
                )}
                {announcements.map((a) => (
                  <div key={a.id} className="pb-3 border-b last:border-0">
                    <p className="text-sm font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{a.body}</p>
                    <p className="text-[10px] text-muted-foreground/70 mt-1">
                      {formatDistanceToNow(new Date(a.published_at), { addSuffix: true })}
                    </p>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </ScrollReveal>

          {/* Referral Leaderboards */}
          <ScrollReveal delay={360} className="md:col-span-2 lg:col-span-3">
            <div className="grid md:grid-cols-2 gap-5">
              <ReferralLeaderboard />
              <LionsReferralLeaderboard />
            </div>
          </ScrollReveal>

          {/* Impact Lions Invite */}
          <ScrollReveal delay={400} className="md:col-span-2 lg:col-span-3">
            <div className="bg-gold-muted border border-gold/20 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
              <img src={lionsEmblem} alt="Impact Lions" className="w-16 h-16 object-contain" />
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                  <Crown size={16} className="text-gold" />
                  <p className="font-display font-semibold">Join the Impact Lions Club</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Make a difference while networking. Access exclusive charity events, ESG reporting, and fundraising tools.
                </p>
              </div>
              <Button variant="gold" size="lg">
                Join for £250/year
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </main>
    </div>
  );
}

function DashboardCard({
  title,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card rounded-xl border p-5 shadow-sm ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon size={16} className="text-muted-foreground" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function calcCompletion(p: any | null): number {
  if (!p) return 0;
  const fields = ["first_name", "last_name", "company", "title", "industry", "phone", "linkedin", "bio"];
  const filled = fields.filter((f) => p[f] && String(p[f]).trim().length > 0).length;
  return Math.round((filled / fields.length) * 100);
}
