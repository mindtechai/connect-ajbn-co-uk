import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Crown, Loader2, Building2, Linkedin, Globe, BadgeCheck, Moon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MemberBadges } from "@/components/badges/MemberBadges";
import { MemberSafetyMenu } from "@/components/safety/MemberSafetyMenu";
import { MemberActions } from "@/components/member/MemberActions";
import { listBlocked, syncBlocked } from "@/lib/moderation";
import { useUkQuietHoursWindow } from "@/hooks/useQuietHours";

type Member = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  title: string | null;
  industry: string | null;
  bio: string | null;
  linkedin: string | null;
  tags: string[] | null;
  is_lion: boolean;
  is_messaging_active: boolean;
  enquiry_count: number | null;
  is_verified_connector: boolean | null;
  is_top_ambassador: boolean | null;
  calendly_url?: string | null;
  quiet_hours_enabled?: boolean;
};

type CorporateMember = {
  id: string;
  company_name: string;
  industry: string | null;
  city: string | null;
  membership_tier: string | null;
  job_title: string | null;
  short_bio: string | null;
  website: string | null;
  linkedin_url: string | null;
  verified: boolean;
  owner_user_id: string | null;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function DirectoryPage() {
  const { user, session, roles, loading: authLoading } = useAuth();
  // A demo/mock session has no real backend token; querying with it hits the
  // database as an anonymous caller and is rejected by access rules.
  const hasRealSession = !!session?.access_token && session.access_token !== "demo";
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [companies, setCompanies] = useState<CorporateMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState<string>("all");
  const inQuietHoursWindow = useUkQuietHoursWindow();

  const canAccess = !!user;
  // Only approved membership levels can see listings; prospective sign-ups see a teaser.
  const isApprovedMember =
    roles.includes("ajbn_member") || roles.includes("impact_lion") || roles.includes("super_admin");

  useEffect(() => {
    if (authLoading || !user) return;
    if (!hasRealSession) { setLoading(false); return; }
    (async () => {
      const [{ data: memberRows }, { data: companyRows }] = await Promise.all([
        (supabase as any).rpc("member_directory_list"),
        supabase
          .from("corporate_members")
          .select(
            "id,company_name,industry,city,membership_tier,job_title,short_bio,website,linkedin_url,verified,owner_user_id",
          )
          .order("company_name", { ascending: true }),
      ]);
      setMembers((memberRows ?? []) as Member[]);
      setCompanies((companyRows ?? []) as CorporateMember[]);
      setLoading(false);
    })();
  }, [user, authLoading, hasRealSession]);

  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setBlockedIds(listBlocked());
    sync();
    void syncBlocked();
    window.addEventListener("ajbn-moderation-changed", sync);
    return () => window.removeEventListener("ajbn-moderation-changed", sync);
  }, []);

  const industries = useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => m.industry && set.add(m.industry));
    companies.forEach((c) => c.industry && set.add(c.industry));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [members, companies]);

  const search = q.trim().toLowerCase();

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      if (blockedIds.includes(m.id)) return false;
      if (industry !== "all" && m.industry !== industry) return false;
      if (!search) return true;
      const haystack = [m.first_name, m.last_name, m.company, m.title, m.industry, m.bio, ...(m.tags ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }, [members, search, industry, blockedIds]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      if (industry !== "all" && c.industry !== industry) return false;
      if (!search) return true;
      const haystack = [c.company_name, c.industry, c.city, c.membership_tier, c.job_title, c.short_bio]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(search);
    });
  }, [companies, search, industry]);

  const shownTotal = filteredMembers.length + filteredCompanies.length;
  const total = members.length + companies.length;

  return (
    <AppLayout maxWidth="6xl">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Member Directory</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse the AJBN corporate membership. Only active members can see this directory.
        </p>
      </div>

      {!canAccess ? (
        <div className="bg-card border rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">Please sign in to browse the directory.</p>
        </div>
      ) : loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      ) : !isApprovedMember ? (
        <div className="bg-card border rounded-xl p-8 text-center space-y-5">
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Live from the AJBN member directory. Full profiles available to active members after
            sign-in.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto select-none" aria-hidden="true">
            {["AJ", "BN", "CC"].map((tile) => (
              <div
                key={tile}
                className="h-20 rounded-xl bg-muted border flex items-center justify-center blur-[3px] opacity-70"
              >
                <span className="text-sm font-semibold text-muted-foreground">{tile}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Your membership is awaiting approval. You'll see the full directory as soon as it's
            active.
          </p>
        </div>
      ) : (

        <>
          <div className="mb-6 flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search companies, members, industries, cities…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="md:w-72">
                <SelectValue placeholder="All industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All industries</SelectItem>
                {industries.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            Showing {shownTotal} of {total} listings
          </p>

          {filteredMembers.length > 0 && (
            <>
              <h2 className="text-sm font-semibold mb-3">Members on AJBN Connect</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {filteredMembers.map((m) => {
                  const name = `${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || "AJBN member";
                  return (
                  <div
                    key={m.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => void navigate({ to: "/member/$memberId", params: { memberId: m.id } })}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        void navigate({ to: "/member/$memberId", params: { memberId: m.id } });
                      }
                    }}
                    className="bg-card border rounded-lg p-5 shadow-xs space-y-2 cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`View ${name}'s profile`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <p className="font-semibold text-sm truncate">
                            {m.first_name} {m.last_name}
                          </p>
                          <MemberBadges
                            verifiedConnector={!!m.is_verified_connector}
                            topAmbassador={!!m.is_top_ambassador}
                          />
                          {m.quiet_hours_enabled && inQuietHoursWindow && (
                            <Badge variant="secondary" className="gap-1 text-[10px] whitespace-nowrap">
                              <Moon size={10} aria-hidden="true" /> In Quiet Hours
                            </Badge>
                          )}
                        </div>
                        {m.title && <p className="text-xs text-muted-foreground truncate">{m.title}</p>}
                      </div>
                      {m.is_lion && <Crown size={16} className="text-gold shrink-0" />}
                    </div>
                    {m.company && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Building2 size={12} /> {m.company}
                      </p>
                    )}
                    {m.industry && (
                      <Badge variant="outline" className="text-[10px]">
                        {m.industry}
                      </Badge>
                    )}
                    {m.tags && m.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {m.tags.slice(0, 6).map((t) => (
                          <Badge key={t} variant="secondary" className="text-[10px]">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {m.bio && <p className="text-xs text-muted-foreground line-clamp-3 pt-1">{m.bio}</p>}
                    <div className="pt-2 border-t space-y-2" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                      {m.id !== user?.id && <MemberActions member={{ id: m.id, name, calendlyUrl: m.calendly_url, messagingActive: m.is_messaging_active }} compact />}
                      <div className="flex gap-2 items-center">
                      {m.linkedin && /^https?:\/\//i.test(m.linkedin) && (
                        <a
                          href={m.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                        >
                          <Linkedin size={12} /> LinkedIn
                        </a>
                      )}
                      {m.id !== user?.id && (
                        <div className="ml-auto">
                          <MemberSafetyMenu
                            memberId={m.id}
                            memberName={`${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || "this member"}
                            context="profile"
                            size="sm"
                          />
                        </div>
                      )}
                      </div>
                    </div>
                  </div>
                );})}
              </div>
            </>
          )}

          <h2 className="text-sm font-semibold mb-3">Corporate members</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((c) => {
              const owner = c.owner_user_id ? members.find((member) => member.id === c.owner_user_id) : undefined;
              const ownerName = owner ? `${owner.first_name ?? ""} ${owner.last_name ?? ""}`.trim() || c.company_name : c.company_name;
              return (
              <div
                key={c.id}
                role="link"
                tabIndex={0}
                onClick={() => void navigate({ to: "/company/$companyId", params: { companyId: c.id } })}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    void navigate({ to: "/company/$companyId", params: { companyId: c.id } });
                  }
                }}
                className="bg-card border rounded-lg p-5 shadow-xs space-y-2 cursor-pointer transition-colors hover:border-primary/50 hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`View ${c.company_name}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted border flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {initials(c.company_name)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <p className="font-semibold text-sm truncate">{c.company_name}</p>
                      {c.verified && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <BadgeCheck size={14} className="text-primary shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent>Verified AJBN corporate member</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    {c.job_title && <p className="text-xs text-muted-foreground truncate">{c.job_title}</p>}
                    {c.city && <p className="text-[11px] text-muted-foreground/80 truncate">{c.city}</p>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {c.industry && (
                    <Badge variant="outline" className="text-[10px]">
                      {c.industry}
                    </Badge>
                  )}
                  {c.membership_tier && (
                    <Badge variant="secondary" className="text-[10px]">
                      {c.membership_tier}
                    </Badge>
                  )}
                </div>
                {c.short_bio && <p className="text-xs text-muted-foreground line-clamp-3 pt-1">{c.short_bio}</p>}
                {(c.website || c.linkedin_url || owner) && (
                  <div className="pt-2 border-t space-y-2" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
                    {owner && owner.id !== user?.id && <MemberActions member={{ id: owner.id, name: ownerName, calendlyUrl: owner.calendly_url, messagingActive: owner.is_messaging_active }} compact />}
                    <div className="flex gap-3 items-center">
                    {c.website && /^https?:\/\//i.test(c.website) && (
                      <a
                        href={c.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        <Globe size={12} /> Website
                      </a>
                    )}
                    {c.linkedin_url && /^https?:\/\//i.test(c.linkedin_url) && (
                      <a
                        href={c.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        <Linkedin size={12} /> LinkedIn
                      </a>
                    )}
                    </div>
                  </div>
                )}
              </div>
            );})}
            {shownTotal === 0 && (
              <p className="col-span-full text-center text-sm text-muted-foreground py-12">
                No members match your filters.
              </p>
            )}
          </div>
        </>
      )}

    </AppLayout>
  );
}
