import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Crown, Loader2, Building2, Linkedin, Send } from "lucide-react";
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
};

export default function DirectoryPage() {
  const { user, roles, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { isActive: myMessagingActive, activate } = useMessagingProfile();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [pendingRecipient, setPendingRecipient] = useState<Member | null>(null);

  const canAccess = roles.includes("ajbn_member") || roles.includes("impact_lion") || roles.includes("super_admin");

  useEffect(() => {
    if (authLoading || !user) return;
    (async () => {
      const { data } = await (supabase as any).rpc("member_directory_list");
      setMembers((data ?? []) as Member[]);
      setLoading(false);
    })();
  }, [user, authLoading]);

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();
    if (!search) return members;
    return members.filter((m) => {
      const haystack = [
        m.first_name, m.last_name, m.company, m.title, m.industry, m.bio,
        ...(m.tags ?? []),
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(search);
    });
  }, [members, q]);

  const openChatWith = async (m: Member) => {
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
            <p className="text-sm text-muted-foreground">Your application is under review. Once approved, the directory unlocks automatically.</p>
          </div>
        ) : loading ? (
          <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="mb-6">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search names, companies, bios, industries, tags…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                Try keywords like "Barrister", "Architect", "Solicitor", "Funder", "IFA", or a company name.
              </p>
            </div>

            <p className="text-xs text-muted-foreground mb-3">
              Showing {filtered.length} of {members.length} members
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((m) => (
                <div key={m.id} className="bg-card border rounded-xl p-5 shadow-sm space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <p className="font-semibold text-sm truncate">{m.first_name} {m.last_name}</p>
                        <MemberBadges
                          verifiedConnector={!!m.is_verified_connector}
                          topAmbassador={!!m.is_top_ambassador}
                        />
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