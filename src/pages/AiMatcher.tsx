import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, Building2, Flag, Loader2, Lock, MessageCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { openMemberConversation } from "@/components/member/MemberActions";
import { aiMatcherEnabledFor } from "@/lib/ai-matcher-flag";
import { matchBusinessNeed, type MatchResult } from "@/lib/ai-matcher.functions";
import { ServiceFilter } from "@/components/directory/ServiceFilter";
import { useServiceTaxonomy } from "@/hooks/useServiceTaxonomy";

const DISCLAIMER =
  "AI suggestions are not recommendations. Members must conduct their own due diligence and verify suitability before any business decision or referral. Provided for informational purposes only.";

export default function AiMatcherPage() {
  const { user, isApprovedMember, loading } = useAuth();
  const navigate = useNavigate();
  const { services } = useServiceTaxonomy();
  const [service, setService] = useState<string>("");
  const [need, setNeed] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [searched, setSearched] = useState<string>("");
  const [reported, setReported] = useState<Record<string, boolean>>({});

  const featureVisible = aiMatcherEnabledFor(user?.email ?? null);
  const canUse = !loading && !!user && isApprovedMember && featureVisible;

  async function onSubmit() {
    if (!service || busy) return;
    setBusy(true);
    setResult(null);
    try {
      const res = await matchBusinessNeed({
        data: { service, context: need.trim() || undefined },
      });
      if (!res.ok) {
        toast.error(
          res.error === "rate_limited"
            ? "You've used your 5 matches for this hour. Please try again later."
            : res.error === "not_approved"
              ? "Your membership is pending approval."
              : "The matcher is unavailable right now. Please try again shortly.",
        );
        return;
      }
      setResult(res.result);
      setSearched(service);
      if (res.result.matches.length === 0) {
        toast.info("No members or companies are tagged with that service yet.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }


  async function onMessage(memberId: string) {
    try {
      const conversationId = await openMemberConversation(memberId);
      navigate(`/messages/${conversationId}`);
    } catch {
      toast.error("Could not open the conversation.");
    }
  }

  async function onReport(key: string, suggestion: unknown) {
    if (!user) return;
    const { error } = await supabase.from("ai_reports").insert({
      reporter_id: user.id,
      business_need: need.trim().slice(0, 1000),
      suggestion: suggestion as never,
    });
    if (error) {
      toast.error("Could not send the report.");
      return;
    }
    setReported((r) => ({ ...r, [key]: true }));
    toast.success("Thanks — the AJBN team will review this suggestion.");
  }

  if (!canUse) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-lg px-4 py-12">
          <div className="rounded-xl border bg-card p-6 text-center shadow-xs">
            <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-primary/10">
              <Lock size={18} className="text-primary" />
            </div>
            <h1 className="mb-2 font-display text-lg font-bold">
              Members only — Join AJBN to access AI Business Matcher
            </h1>
            <p className="mb-5 text-sm text-muted-foreground">
              The AI Business Needs Matcher is available to approved AJBN members. Questions?
              Email admin@ajbn.co.uk.
            </p>
            <Link to="/register">
              <Button className="w-full sm:w-auto">Apply for membership</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center gap-2">
          <Sparkles size={20} className="text-primary" />
          <h1 className="font-display text-2xl font-bold">AI Business Needs Matcher</h1>
          <Badge variant="secondary" className="text-[11px]">AI Matcher (Beta)</Badge>
        </div>

        <div className="space-y-3 rounded-xl border bg-card p-5 shadow-xs">
          <Label>What do you need?</Label>
          <ServiceFilter
            services={services}
            selected={service ? [service] : []}
            onChange={(next) => setService(next[next.length - 1] ?? "")}
          />
          <Label htmlFor="need">Tell us more (optional)</Label>
          <Textarea
            id="need"
            rows={4}
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            onFocus={(e) =>
              e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" })
            }
            placeholder="Commercial property purchase in North London, completing in eight weeks..."
          />
          <p className="text-xs text-muted-foreground">{DISCLAIMER}</p>
        </div>

        <div className="sticky bottom-0 z-50 -mx-4 mt-3 border-t bg-background/95 px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+80px)] backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:pb-0 md:backdrop-blur-none">
          <Button onClick={onSubmit} disabled={!service || busy} className="w-full sm:w-auto">
            {busy ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
            {busy ? stage : "Find Matches"}
          </Button>
        </div>

        {result ? (
          <div className="mt-6 space-y-5">
            {result.matches.length > 0 ? (
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Best matches for {searched}
                  </h2>
                  <Link
                    to={`/directory?service=${encodeURIComponent(searched)}`}
                    className="inline-flex items-center gap-1 text-xs text-primary underline"
                  >
                    View all in Directory <ArrowRight size={12} />
                  </Link>
                </div>
                {result.matches.map((m) => (
                  <div key={m.key} className="rounded-xl border bg-card p-4 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{m.name}</p>
                        {m.kind === "company" ? (
                          <p className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Building2 size={13} /> Company listing
                          </p>
                        ) : m.business ? (
                          <p className="text-sm text-muted-foreground">{m.business}</p>
                        ) : null}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Report this suggestion"
                        disabled={reported[m.key]}
                        onClick={() => onReport(m.key, m)}
                      >
                        <Flag size={15} className={reported[m.key] ? "text-muted-foreground" : ""} />
                      </Button>
                    </div>
                    <p className="mt-2 text-sm">{m.reason}</p>
                    {m.kind === "member" && m.member_id ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 gap-1.5"
                        onClick={() => onMessage(m.member_id as string)}
                      >
                        <MessageCircle size={14} /> Message
                      </Button>
                    ) : m.company_id ? (
                      <Link to={`/company/${m.company_id}`}>
                        <Button variant="outline" size="sm" className="mt-3 gap-1.5">
                          <Building2 size={14} /> View listing
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                ))}
              </section>
            ) : (
              <p className="text-sm text-muted-foreground">
                No members or companies are tagged with {searched} yet.
              </p>
            )}


            <section className="rounded-xl border bg-muted/40 p-5">
              <h2 className="mb-2 font-display text-base font-bold">Referral Opportunity</h2>
              <p className="text-sm leading-relaxed text-foreground/90">
                Every great connection starts with trust. If you've worked with someone
                exceptional — who delivers, follows through, and represents our values — invite
                them in.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/90">
                Help us build London's most trusted business network, where quality introductions
                create real growth for everyone.
              </p>
            </section>

            <p className="text-xs text-muted-foreground">
              AI suggestions are not recommendations — please conduct your own due diligence.
            </p>
          </div>
        ) : null}
      </div>
    </AppLayout>
  );
}
