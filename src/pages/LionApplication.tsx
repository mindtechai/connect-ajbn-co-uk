import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Crown, Loader2 } from "lucide-react";

type App = { status: "pending" | "approved" | "rejected"; motivation: string; review_notes: string | null; created_at: string };

export default function LionApplicationPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [existing, setExisting] = useState<App | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [motivation, setMotivation] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLion, setIsLion] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login?next=/lions/apply"); return; }
    // Demo mode: skip backend calls, load any previously-submitted demo application from localStorage.
    try {
      const saved = localStorage.getItem("ajbn_demo_lion_application");
      if (saved) {
        const parsed = JSON.parse(saved) as App;
        setExisting(parsed);
        setMotivation(parsed.motivation);
        setSubmitted(true);
      }
    } catch {}
    setLoading(false);
  }, [user, authLoading, navigate]);

  const submit = async () => {
    if (!motivation.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    const record: App = { status: "pending", motivation: motivation.trim(), review_notes: null, created_at: new Date().toISOString() };
    try { localStorage.setItem("ajbn_demo_lion_application", JSON.stringify(record)); } catch {}
    setExisting(record);
    setSubmitted(true);
    setSaving(false);
    toast({ title: "Application Submitted Successfully!", description: "Thank you — a super admin will review shortly." });
  };

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

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

        {isLion || submitted ? (
          <div className="bg-gold/10 border border-gold/30 rounded-xl p-6 text-center">
            <Crown className="mx-auto text-gold mb-2" />
            <p className="font-semibold text-lg">Application Submitted Successfully!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Thank you for stepping forward. A super admin will be in touch shortly to welcome you into the Impact Lions Club.
            </p>
            {existing?.motivation && (
              <p className="text-xs text-muted-foreground italic mt-3">"{existing.motivation}"</p>
            )}
          </div>
        ) : (
          <div className="bg-card border rounded-xl p-6 shadow-sm space-y-5">
            {existing && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Current status:</span>
                <Badge variant={existing.status === "pending" ? "secondary" : existing.status === "approved" ? "default" : "destructive"}>
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
                rows={6}
                value={motivation}
                onChange={(e) => setMotivation(e.target.value)}
                placeholder="Tell us why you'd like to become an Impact Lion, and any causes you're passionate about…"
                disabled={existing?.status === "pending"}
              />
            </div>
            {existing?.status !== "pending" && (
              <div className="flex justify-end">
                <Button onClick={submit} disabled={saving || !motivation.trim()} className="gap-1.5">
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  {existing ? "Re-submit application" : "Submit application"}
                </Button>
              </div>
            )}
            {existing?.status === "pending" && (
              <p className="text-sm text-muted-foreground text-center">Your application is under review.</p>
            )}
          </div>
        )}
      </>
    </AppLayout>
  );
}