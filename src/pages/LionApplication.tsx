import { useEffect, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useServerFn } from "@tanstack/react-start";
import { notifyLionApplication } from "@/lib/lion-application.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Crown, Loader2 } from "lucide-react";

type App = {
  id?: string;
  status: "pending" | "approved" | "rejected";
  motivation: string;
  linkedin_url: string | null;
  referral_experience: string | null;
  payment_ack: boolean;
  review_notes: string | null;
  created_at: string;
};

export default function LionApplicationPage() {
  const { user, session, roles, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const notify = useServerFn(notifyLionApplication);
  const [existing, setExisting] = useState<App | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [motivation, setMotivation] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [experience, setExperience] = useState("");
  const [payAck, setPayAck] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const isLion = roles.includes("impact_lion");
  const isApprovedMember =
    isLion || roles.includes("ajbn_member") || roles.includes("super_admin");
  // A demo/mock session has no real backend token, so skip database calls with it.
  const hasRealSession = !!session?.access_token && session.access_token !== "demo";

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/login?next=/lions/apply");
      return;
    }
    if (!hasRealSession) {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("lion_applications")
        .select("id, status, motivation, linkedin_url, referral_experience, payment_ack, review_notes, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!active) return;
      if (data) {
        const row = data as unknown as App;
        setExisting(row);
        setMotivation(row.motivation ?? "");
        setLinkedin(row.linkedin_url ?? "");
        setExperience(row.referral_experience ?? "");
        setPayAck(!!row.payment_ack);
        if (row.status === "pending" || row.status === "approved") setSubmitted(true);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user, authLoading, hasRealSession, navigate]);

  const submit = async () => {
    if (!user || !motivation.trim() || !payAck) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("lion_applications")
      .insert({
        user_id: user.id,
        motivation: motivation.trim(),
        linkedin_url: linkedin.trim() || null,
        referral_experience: experience.trim() || null,
        payment_ack: true,
      } as never)
      .select("id, status, motivation, linkedin_url, referral_experience, payment_ack, review_notes, created_at")
      .maybeSingle();

    if (error || !data) {
      setSaving(false);
      toast({
        title: "Could not submit application",
        description: error?.message ?? "Please try again in a moment.",
        variant: "destructive",
      });
      return;
    }

    const row = data as unknown as App;
    setExisting(row);
    setSubmitted(true);
    setSaving(false);
    toast({
      title: "Application Submitted Successfully!",
      description: "Thank you — the Impact Lions team will be in touch shortly.",
    });

    if (row.id) {
      try {
        await notify({ data: { applicationId: row.id } });
      } catch {
        // The application is saved; a failed notification must not block the member.
      }
    }
  };

  if (loading)
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );

  return (
    <AppLayout maxWidth="2xl">
      <>
        <div className="flex items-center gap-2 mb-1">
          <Crown className="text-gold" size={22} />
          <h1 className="text-2xl md:text-3xl font-display font-bold">Impact Lions Club</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          The charitable arm of AJBN. Members contribute £250/year to fund community initiatives, ESG projects and event fundraising.
        </p>

        {!isApprovedMember ? (
          <div className="bg-card border rounded-xl p-6 text-center">
            <Crown className="mx-auto text-gold mb-2" />
            <p className="font-semibold text-lg">AJBN membership required</p>
            <p className="text-sm text-muted-foreground mt-1">
              Your AJBN membership is awaiting approval. Once it's active you can apply for the
              Impact Lions Club for £250/year.
            </p>
          </div>
        ) : isLion || submitted ? (
          <div className="bg-gold/10 border border-gold/30 rounded-xl p-6 text-center">
            <Crown className="mx-auto text-gold mb-2" />
            <p className="font-semibold text-lg">Application Submitted Successfully!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Thank you for stepping forward. The Impact Lions team will be in touch shortly to welcome you into the club.
            </p>
            {existing?.motivation && (
              <p className="text-xs text-muted-foreground italic mt-3">"{existing.motivation}"</p>
            )}
          </div>
        ) : (
          <div className="bg-card border rounded-xl p-6 shadow-xs space-y-5">
            {existing && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Current status:</span>
                <Badge variant={existing.status === "approved" ? "default" : "destructive"}>
                  {existing.status}
                </Badge>
              </div>
            )}
            {existing?.review_notes && (
              <p className="text-sm bg-muted p-3 rounded-md">Reviewer notes: {existing.review_notes}</p>
            )}
            <div className="space-y-2">
              <Label>Why do you want to join the Impact Lions Club?</Label>
              <Textarea
                rows={5}
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder="Tell us why you'd like to become an Impact Lion, and any causes you're passionate about…"
              />
            </div>
            <div className="space-y-2">
              <Label>Your LinkedIn profile</Label>
              <Input
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://www.linkedin.com/in/…"
              />
            </div>
            <div className="space-y-2">
              <Label>Your referral / introduction experience</Label>
              <Textarea
                rows={4}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Introductions you've made within business networks, and how you'd help fellow members…"
              />
            </div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="lion-pay"
                checked={payAck}
                onCheckedChange={(v) => setPayAck(v === true)}
              />
              <Label htmlFor="lion-pay" className="text-sm font-normal leading-relaxed">
                I agree to pay the £250 annual Impact Lions contribution
              </Label>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={submit}
                disabled={saving || !motivation.trim() || !payAck}
                className="gap-1.5"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {existing ? "Re-submit application" : "Submit application"}
              </Button>
            </div>
          </div>
        )}
      </>
    </AppLayout>
  );
}
