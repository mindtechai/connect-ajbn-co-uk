import { useEffect, useState } from "react";
import { displayFirstName } from "@/lib/display-name";
import { Link, useNavigate } from "@tanstack/react-router";
import { BookUser, CalendarDays, Clock, HandHeart, Loader2, Mail, MessageCircle, Award } from "lucide-react";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";
import { assetUrl } from "@/lib/asset";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const UNLOCKS = [
  { icon: BookUser, label: "Members Directory", hint: "Search members by industry" },
  { icon: MessageCircle, label: "1-2-1 Messaging", hint: "Chat privately with members" },
  { icon: Award, label: "Referral Rewards", hint: "Earn credit for introductions" },
  { icon: HandHeart, label: "Needs & Offers", hint: "Post a need or offer help" },
  { icon: CalendarDays, label: "Events", hint: "RSVP to AJBN events" },
];

/** Shown to members whose registration is awaiting admin approval. */
export default function PendingPage() {
  const { user, isApprovedMember, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ first_name: string | null; company: string | null } | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) { void navigate({ to: "/login" }); return; }
    if (isApprovedMember) { void navigate({ to: "/dashboard" }); return; }
    void supabase
      .from("profiles")
      .select("first_name, company")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setProfile(data ?? null));
  }, [user?.id, isApprovedMember, loading]);

  if (loading || !user) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  const firstName = displayFirstName(profile, user);
  const company = profile?.company || (user.user_metadata?.["company"] as string | undefined) || "";

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-12 max-w-2xl pb-[calc(env(safe-area-inset-bottom)+72px)] md:pb-12">
        <div className="text-center">
          <img src={assetUrl(ajbnLogo)} alt="AJBN" className="mx-auto h-14 w-14 rounded-xl object-cover" />
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold-muted px-3 py-1 text-xs font-semibold">
            <Clock size={13} /> Awaiting approval
          </div>
          <h1 className="mt-4 font-display text-2xl md:text-3xl font-bold">Welcome back, {firstName}</h1>
          <p className="mt-2 text-base font-medium">Your application is pending approval</p>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Your membership{company ? ` for ${company}` : ""} is under review by AJBN admin.
            You'll receive email confirmation once approved (usually within 24 hours).
          </p>
        </div>

        <section className="mt-8 rounded-xl border bg-card p-5 shadow-xs" aria-labelledby="pending-unlocks">
          <h2 id="pending-unlocks" className="text-sm font-semibold">What you'll unlock once approved</h2>
          <ul className="mt-4 space-y-3">
            {UNLOCKS.map(({ icon: Icon, label, hint }) => (
              <li key={label} className="flex items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon size={17} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-xs text-muted-foreground">{hint}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline"><Link to="/">Back to Home</Link></Button>
          <Button asChild>
            <a href="mailto:admin@ajbn.co.uk?subject=AJBN%20Connect%20membership%20approval">
              <Mail size={15} /> Contact Admin
            </a>
          </Button>
        </div>
      </main>
    </div>
  );
}
