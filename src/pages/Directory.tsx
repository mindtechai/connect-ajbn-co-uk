import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Crown, Loader2, Building2, Linkedin, Send } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useMessagingProfile } from "@/hooks/useMessagingProfile";
import { ActivateMessagingDialog } from "@/components/messaging/ActivateMessagingDialog";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MemberBadges } from "@/components/badges/MemberBadges";

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
  city?: string | null;
  email?: string | null;
  avatar_url?: string | null;
};

// -------- Demo fallback data (used when the live directory is empty) --------
const baseMembers = [
  { company: "AccountingPreneur", industry: "Accountants/Tax Matters" },
  { company: "ActionCoach", industry: "Business Growth Coach" },
  { company: "ADBH Advisory Limited", industry: "Immigration Legal Services" },
  { company: "BDO", industry: "Financial Services" },
  { company: "Allica Bank", industry: "Banking" },
  { company: "Atom CTO", industry: "IT Services & IT Consultancy" },
  { company: "Vyman Solicitors", industry: "Law Firm" },
  { company: "Gravita", industry: "Accountants & Business Advisors" },
  { company: "Investec", industry: "Private Banking & Wealth Management" },
  { company: "MT Finance", industry: "Bridging & Property Finance" },
  { company: "DNS Accountants Ltd", industry: "Accountants/Tax Advisors" },
  { company: "Shawbrook Bank", industry: "Specialist Banking & Finance" },
];

const FIRST_NAMES = [
  "David","Sarah","James","Emma","Michael","Priya","Rajesh","Anita","Chris","Olivia",
  "Daniel","Sophie","Aarav","Isla","Nikhil","Charlotte","Ben","Aisha","Tom","Hannah",
  "Rohan","Grace","Jack","Meera","Simon","Chloe","Adam","Ruby","Karan","Lily",
];
const LAST_NAMES = [
  "Jones","Smith","Patel","Shah","Khan","Williams","Brown","Taylor","Davies","Evans",
  "Wilson","Thomas","Roberts","Walker","Wright","Robinson","Mehta","Kapoor","Green","Hall",
];
const UK_CITIES = [
  "London","Manchester","Birmingham","Leeds","Bristol","Edinburgh","Glasgow",
  "Liverpool","Cambridge","Oxford","Reading","Brighton","Nottingham","Sheffield",
];
const TITLES = [
  "Partner","Director","Managing Director","Senior Associate","Founder","CEO",
  "Head of Finance","Business Development Manager","Investment Director","Consultant",
];
const AVATAR_SEEDS = [
  "photo-1507003211169-0a1dd7228f2d","photo-1544005313-94ddf0286df2",
  "photo-1500648767791-00dcc994a43e","photo-1494790108377-be9c29b29330",
  "photo-1519085360753-af0119f7cbe7","photo-1531123897727-8f129e1688ce",
  "photo-1580489944761-15a19d654956","photo-1508214751196-bcfd4ca60f91",
  "photo-1517841905240-472988babdf9","photo-1573496359142-b8d87734a5a2",
];
const rand = <T,>(arr: T[], i: number) => arr[i % arr.length];

function generateDemoMembers(): Member[] {
  const out: Member[] = [];
  let idx = 0;
  for (let i = 0; i < 110; i++) {
    const base = baseMembers[i % baseMembers.length];
    const first = rand(FIRST_NAMES, idx * 7 + 3);
    const last = rand(LAST_NAMES, idx * 11 + 1);
    const city = rand(UK_CITIES, idx * 5);
    const title = rand(TITLES, idx * 3);
    const avatar = rand(AVATAR_SEEDS, idx);
    const suffix = i >= baseMembers.length ? ` ${Math.floor(i / baseMembers.length) + 1}` : "";
    const company = `${base.company}${suffix}`;
    out.push({
      id: `demo-${i}`,
      first_name: first,
      last_name: last,
      company,
      title,
      industry: base.industry,
      bio: `${title} at ${company}, based in ${city}. Passionate about connecting corporate members across the AJBN network.`,
      linkedin: `https://linkedin.com/in/${first.toLowerCase()}-${last.toLowerCase()}-${i}`,
      tags: [base.industry.split("/")[0].split(" ")[0], city],
      is_lion: i % 9 === 0,
      is_messaging_active: i % 3 !== 0,
      enquiry_count: (i * 3) % 12,
      is_verified_connector: i % 8 === 0,
      is_top_ambassador: i % 15 === 0,
      city,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${base.company.toLowerCase().replace(/[^a-z0-9]+/g, "")}.co.uk`,
      avatar_url: `https://images.unsplash.com/${avatar}?auto=format&fit=facearea&facepad=3&w=200&h=200&q=60`,
    });
    idx++;
  }
  return out;
}
// ---------------------------------------------------------------------------

export default function DirectoryPage() {
  const { user, roles, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { isActive: myMessagingActive, activate } = useMessagingProfile();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState<string>("all");
  const [pendingRecipient, setPendingRecipient] = useState<Member | null>(null);

  const canAccess = !!user;

  useEffect(() => {
    if (authLoading || !user) return;
    (async () => {
      const { data } = await (supabase as any).rpc("member_directory_list");
      const live = (data ?? []) as Member[];
      // Fall back to a rich, generated demo dataset when the directory is empty.
      setMembers(live.length > 0 ? live : generateDemoMembers());
      setLoading(false);
    })();
  }, [user, authLoading]);

  const industries = useMemo(() => {
    const set = new Set<string>();
    members.forEach((m) => m.industry && set.add(m.industry));
    return Array.from(set).sort();
  }, [members]);

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();
    return members.filter((m) => {
      if (industry !== "all" && m.industry !== industry) return false;
      if (!search) return true;
      const haystack = [
        m.first_name, m.last_name, m.company, m.title, m.industry, m.bio, m.city, m.email,
        ...(m.tags ?? []),
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(search);
    });
  }, [members, q, industry]);

  const openChatWith = async (m: Member) => {
    if (m.id.startsWith("demo-")) {
      toast.info("This is a demo profile. Messaging is disabled for placeholder members.");
      return;
    }
    if (!m.is_messaging_active) {
      toast.info(`${m.first_name ?? "This member"} hasn't enabled messaging yet.`);
      return;
    }
    if (!myMessagingActive) {
      setPendingRecipient(m);
      return;
    }
    const { data, error } = await (supabase as any).rpc("start_or_get_conversation", { _other: m.id });
    if (error) { toast.error(error.message); return; }
    navigate(`/messages/${data}`);
  };

  return (
    <AppLayout maxWidth="6xl">

      <>
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold">Member Directory</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Browse the AJBN community. Only active corporate members can see other members.
          </p>
        </div>

        {!canAccess ? (
          <div className="bg-card border rounded-xl p-8 text-center">
            <p className="text-sm text-muted-foreground">Please sign in to browse the directory.</p>
          </div>
        ) : loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="mb-6 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search names, companies, bios, industries, tags…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="md:w-64">
                  <SelectValue placeholder="All industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All industries</SelectItem>
                  {industries.map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <p className="text-xs text-muted-foreground mb-3">
              Showing {filtered.length} of {members.length} members
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((m) => (
                <div key={m.id} className="bg-card border rounded-xl p-5 shadow-sm space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 min-w-0">
                      {m.avatar_url && (
                        <img
                          src={m.avatar_url}
                          alt={`${m.first_name ?? ""} ${m.last_name ?? ""}`.trim() || "Member avatar"}
                          loading="lazy"
                          className="w-10 h-10 rounded-full object-cover border shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="font-semibold text-sm truncate">{m.first_name} {m.last_name}</p>
                        <MemberBadges
                          verifiedConnector={!!m.is_verified_connector}
                          topAmbassador={!!m.is_top_ambassador}
                        />
                      </div>
                      {m.title && <p className="text-xs text-muted-foreground truncate">{m.title}</p>}
                      {m.city && <p className="text-[11px] text-muted-foreground/80 truncate">{m.city}</p>}
                      </div>
                    </div>
                    {m.is_lion && <Crown size={16} className="text-gold shrink-0" />}
                  </div>
                  {m.company && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Building2 size={12} /> {m.company}
                    </p>
                  )}
                  {m.industry && <Badge variant="outline" className="text-[10px]">{m.industry}</Badge>}
                  {m.tags && m.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {m.tags.slice(0, 6).map((t) => (
                        <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                      ))}
                    </div>
                  )}
                  {m.bio && <p className="text-xs text-muted-foreground line-clamp-3 pt-1">{m.bio}</p>}
                  <div className="flex gap-2 pt-2 border-t">
                    {m.id !== user?.id && (
                      m.is_messaging_active ? (
                        <button
                          onClick={() => openChatWith(m)}
                          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium"
                          aria-label={`Send message to ${m.first_name ?? "member"}`}
                        >
                          <Send size={12} /> Send Message
                        </button>
                      ) : (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-xs text-muted-foreground/60 flex items-center gap-1 cursor-not-allowed">
                              <Send size={12} /> Message
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>This member hasn't enabled messaging yet.</TooltipContent>
                        </Tooltip>
                      )
                    )}
                    {m.linkedin && /^https?:\/\//i.test(m.linkedin) && (
                      <a href={m.linkedin} target="_blank" rel="noreferrer" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
                        <Linkedin size={12} /> LinkedIn
                      </a>
                    )}
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <p className="col-span-full text-center text-sm text-muted-foreground py-12">No members match your filters.</p>
              )}
            </div>
          </>
        )}
      </>

      <ActivateMessagingDialog
        open={!!pendingRecipient}
        onOpenChange={(v) => { if (!v) setPendingRecipient(null); }}
        recipientName={pendingRecipient ? `${pendingRecipient.first_name ?? ""} ${pendingRecipient.last_name ?? ""}`.trim() : undefined}
        recipientId={pendingRecipient?.id}
        activate={activate}
      />
    </AppLayout>
  );
}