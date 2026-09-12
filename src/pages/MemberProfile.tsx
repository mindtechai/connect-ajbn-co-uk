import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Building2, Crown, Linkedin, Loader2, Moon } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { MemberBadges } from "@/components/badges/MemberBadges";
import { MemberActions } from "@/components/member/MemberActions";
import { MemberSafetyMenu } from "@/components/safety/MemberSafetyMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUkQuietHoursWindow } from "@/hooks/useQuietHours";

type MemberDetail = {
  id: string; first_name: string | null; last_name: string | null; company: string | null;
  title: string | null; industry: string | null; bio: string | null; linkedin: string | null;
  tags: string[] | null; is_lion: boolean; is_messaging_active: boolean;
  calendly_url: string | null; quiet_hours_enabled: boolean;
};

export default function MemberProfilePage() {
  const { memberId } = useParams({ from: "/member/$memberId" });
  const { roles, loading: authLoading } = useAuth();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const inQuietHours = useUkQuietHoursWindow();
  const approved = roles.some((role) => ["ajbn_member", "impact_lion", "super_admin"].includes(role));

  useEffect(() => {
    if (authLoading) return;
    if (!approved) { setLoading(false); return; }
    void supabase.rpc("member_profile_detail", { _member_id: memberId }).then(({ data, error }) => {
      if (error) console.error("member_profile_detail failed", error);
      setMember((data?.[0] as MemberDetail | undefined) ?? null);
      setLoading(false);
    });
  }, [memberId, approved, authLoading]);

  if (loading) return <AppLayout maxWidth="4xl"><div className="py-20 grid place-items-center"><Loader2 className="animate-spin text-muted-foreground" /></div></AppLayout>;
  if (!approved || !member) return <AppLayout maxWidth="4xl"><div className="py-16 text-center"><h1 className="text-2xl font-display font-bold">Member unavailable</h1><p className="mt-2 text-sm text-muted-foreground">This profile is unavailable or your membership is awaiting approval.</p></div></AppLayout>;

  const name = `${member.first_name ?? ""} ${member.last_name ?? ""}`.trim() || "AJBN member";
  return (
    <AppLayout maxWidth="4xl">
      <Button asChild variant="ghost" size="sm" className="mb-5"><Link to="/directory"><ArrowLeft size={15} /> Directory</Link></Button>
      <article className="space-y-6">
        <header className="border-b pb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-display font-bold">{name}</h1>
                {member.is_lion && <Crown size={19} className="text-gold" aria-label="Impact Lion" />}
                <MemberBadges verifiedConnector={false} topAmbassador={false} />
                {member.quiet_hours_enabled && inQuietHours && <Badge variant="secondary"><Moon size={12} /> In Quiet Hours</Badge>}
              </div>
              {member.title && <p className="mt-1 text-muted-foreground">{member.title}</p>}
              {member.company && <p className="mt-2 flex items-center gap-2 text-sm"><Building2 size={15} /> {member.company}</p>}
            </div>
            <MemberSafetyMenu memberId={member.id} memberName={name} context="profile" />
          </div>
        </header>
        <MemberActions member={{ id: member.id, name, calendlyUrl: member.calendly_url, messagingActive: member.is_messaging_active }} showContact />
        <section className="space-y-3">
          {member.industry && <Badge variant="outline">{member.industry}</Badge>}
          {member.bio && <p className="text-sm leading-6 text-muted-foreground whitespace-pre-line">{member.bio}</p>}
          {member.tags && member.tags.length > 0 && <div className="flex flex-wrap gap-2">{member.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}</div>}
          {member.linkedin && /^https?:\/\//i.test(member.linkedin) && <Button asChild variant="outline" size="sm"><a href={member.linkedin} target="_blank" rel="noreferrer"><Linkedin size={15} /> LinkedIn</a></Button>}
        </section>
      </article>
    </AppLayout>
  );
}