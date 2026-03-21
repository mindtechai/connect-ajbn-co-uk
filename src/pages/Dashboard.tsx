import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  Users, CalendarDays, Award, Link2, Bell, Crown,
  Copy, ArrowRight, LogOut
} from "lucide-react";
import lionsEmblem from "@/assets/lions-emblem.png";
import { ReferralLeaderboard } from "@/components/dashboard/ReferralLeaderboard";
import { LionsReferralLeaderboard } from "@/components/dashboard/LionsReferralLeaderboard";

// Mock data
const memberData = {
  name: "Raj Goldstein",
  memberSince: "Jan 2024",
  validUntil: "Jan 2027",
  referralCode: "AJBN-RAJ2024",
  referrals: { total: 3, active: 2, target: 5 },
  profileCompletion: 72,
};

const upcomingEvents = [
  { title: "Q1 Networking Dinner", date: "28 Mar 2026", type: "networking" },
  { title: "FinTech Roundtable", date: "14 Apr 2026", type: "networking" },
  { title: "Annual Flagship Event", date: "19 Oct 2026", type: "networking" },
];

const announcements = [
  { text: "New mentorship programme launching in April — register your interest.", date: "2 days ago" },
  { text: "Annual Flagship Event early bird tickets available.", date: "1 week ago" },
];

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="font-display text-lg font-bold text-primary">AJBN</Link>
          <div className="flex items-center gap-3">
            <button className="relative text-muted-foreground hover:text-foreground">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
            </button>
            <button
              onClick={() => navigate("/login")}
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
              Welcome back, {memberData.name.split(" ")[0]}
            </h1>
            <p className="text-muted-foreground text-sm">
              Member since {memberData.memberSince} · Valid until {memberData.validUntil}
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Profile completion */}
          <ScrollReveal delay={0}>
            <DashboardCard title="Profile Completion" icon={Users}>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{memberData.profileCompletion}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-navy-gradient rounded-full transition-all"
                    style={{ width: `${memberData.profileCompletion}%` }}
                  />
                </div>
                <Button variant="ghost" size="sm" className="text-xs mt-1">
                  Complete Profile <ArrowRight size={14} />
                </Button>
              </div>
            </DashboardCard>
          </ScrollReveal>

          {/* Referrals */}
          <ScrollReveal delay={80}>
            <DashboardCard title="My Referrals" icon={Award}>
              <div className="space-y-3">
                <div className="flex gap-4">
                  <div>
                    <p className="text-2xl font-bold tabular-nums">{memberData.referrals.active}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold tabular-nums">{memberData.referrals.total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Refer {memberData.referrals.target - memberData.referrals.active} more for free membership
                </p>
                <div className="flex items-center gap-2 bg-muted rounded-md px-3 py-2">
                  <code className="text-xs flex-1 truncate">{memberData.referralCode}</code>
                  <button className="text-muted-foreground hover:text-foreground shrink-0">
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
                  Your membership expires on <span className="font-medium text-foreground">{memberData.validUntil}</span>
                </p>
                <Button size="sm" className="w-full">Renew Membership</Button>
              </div>
            </DashboardCard>
          </ScrollReveal>

          {/* Upcoming Events */}
          <ScrollReveal delay={240} className="md:col-span-2">
            <DashboardCard title="Upcoming Events" icon={CalendarDays}>
              <div className="space-y-3">
                {upcomingEvents.map((ev) => (
                  <div key={ev.title} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{ev.title}</p>
                      <p className="text-xs text-muted-foreground">{ev.date}</p>
                    </div>
                    <Button variant="outline" size="sm">RSVP</Button>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </ScrollReveal>

          {/* Announcements */}
          <ScrollReveal delay={320}>
            <DashboardCard title="Announcements" icon={Bell}>
              <div className="space-y-3">
                {announcements.map((a, i) => (
                  <div key={i} className="pb-3 border-b last:border-0">
                    <p className="text-sm">{a.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{a.date}</p>
                  </div>
                ))}
              </div>
            </DashboardCard>
          </ScrollReveal>

          {/* Referral Leaderboard */}
          <ScrollReveal delay={360} className="md:col-span-2 lg:col-span-3">
            <ReferralLeaderboard />
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
