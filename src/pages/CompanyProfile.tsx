import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, BadgeCheck, Building2, Globe, Linkedin, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { MemberActions } from "@/components/member/MemberActions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Company = {
  id: string; company_name: string; industry: string | null; city: string | null;
  membership_tier: string | null; job_title: string | null; short_bio: string | null;
  website: string | null; linkedin_url: string | null; verified: boolean; owner_user_id: string | null;
};
type Owner = { id: string; first_name: string | null; last_name: string | null; calendly_url: string | null; is_messaging_active: boolean };

export default function CompanyProfilePage() {
  const { companyId } = useParams({ from: "/company/$companyId" });
  const { roles, loading: authLoading } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [loading, setLoading] = useState(true);
  const approved = roles.some((role) => ["ajbn_member", "impact_lion", "super_admin"].includes(role));

  useEffect(() => {
    if (authLoading) return;
    if (!approved) { setLoading(false); return; }
    void (async () => {
      const { data, error } = await supabase.from("corporate_members").select("id,company_name,industry,city,membership_tier,job_title,short_bio,website,linkedin_url,verified,owner_user_id").eq("id", companyId).maybeSingle();
      if (error) console.error("corporate member read failed", error);
      const row = data as Company | null;
      setCompany(row);
      if (row?.owner_user_id) {
        const { data: ownerRows } = await supabase.rpc("member_profile_detail", { _member_id: row.owner_user_id });
        setOwner((ownerRows?.[0] as Owner | undefined) ?? null);
      }
      setLoading(false);
    })();
  }, [companyId, approved, authLoading]);

  if (loading) return <AppLayout maxWidth="4xl"><div className="py-20 grid place-items-center"><Loader2 className="animate-spin text-muted-foreground" /></div></AppLayout>;
  if (!approved || !company) return <AppLayout maxWidth="4xl"><div className="py-16 text-center"><h1 className="text-2xl font-display font-bold">Company unavailable</h1><p className="mt-2 text-sm text-muted-foreground">This company listing could not be found.</p></div></AppLayout>;

  const ownerName = owner ? `${owner.first_name ?? ""} ${owner.last_name ?? ""}`.trim() || company.company_name : company.company_name;
  return (
    <AppLayout maxWidth="4xl">
      <Button asChild variant="ghost" size="sm" className="mb-5"><Link to="/directory"><ArrowLeft size={15} /> Directory</Link></Button>
      <article className="space-y-6">
        <header className="border-b pb-6">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 shrink-0 rounded-md border bg-muted grid place-items-center"><Building2 size={25} className="text-muted-foreground" /></div>
            <div>
              <div className="flex items-center gap-2"><h1 className="text-2xl md:text-3xl font-display font-bold">{company.company_name}</h1>{company.verified && <BadgeCheck size={19} className="text-primary" aria-label="Verified company" />}</div>
              <p className="mt-1 text-sm text-muted-foreground">{[company.city, company.job_title].filter(Boolean).join(" · ")}</p>
            </div>
          </div>
        </header>
        {owner ? (
          <MemberActions member={{ id: owner.id, name: ownerName, calendlyUrl: owner.calendly_url, messagingActive: owner.is_messaging_active }} showContact />
        ) : (
          <Alert><Building2 size={16} /><AlertTitle>Company listing</AlertTitle><AlertDescription>This is a company listing. Connect via website.</AlertDescription></Alert>
        )}
        <section className="space-y-4">
          <div className="flex flex-wrap gap-2">{company.industry && <Badge variant="outline">{company.industry}</Badge>}{company.membership_tier && <Badge variant="secondary">{company.membership_tier}</Badge>}</div>
          {company.short_bio && <p className="text-sm leading-6 text-muted-foreground whitespace-pre-line">{company.short_bio}</p>}
          <div className="flex flex-wrap gap-2">
            {company.website && /^https?:\/\//i.test(company.website) && <Button asChild variant="outline"><a href={company.website} target="_blank" rel="noreferrer"><Globe size={16} /> Website</a></Button>}
            {company.linkedin_url && /^https?:\/\//i.test(company.linkedin_url) && <Button asChild variant="outline"><a href={company.linkedin_url} target="_blank" rel="noreferrer"><Linkedin size={16} /> LinkedIn</a></Button>}
          </div>
        </section>
      </article>
    </AppLayout>
  );
}