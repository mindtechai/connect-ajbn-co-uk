import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandLink } from "@/components/BrandLink";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Crown, Loader2 } from "lucide-react";

type App = { status: "pending" | "approved" | "rejected"; motivation: string; review_notes: string | null; created_at: string };

export default function LionApplicationPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [existing, setExisting] = useState<App | null>(null);
  const [motivation, setMotivation] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLion, setIsLion] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    (async () => {
      const [{ data: app }, { data: role }] = await Promise.all([
        supabase.from("lion_applications").select("status, motivation, review_notes, created_at").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "impact_lion").maybeSingle(),
      ]);
      if (app) { setExisting(app as App); setMotivation(app.motivation); }
      setIsLion(!!role);
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  const submit = async () => {
    if (!user || !motivation.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("lion_applications").upsert(
      { user_id: user.id, motivation: motivation.trim(), status: "pending" },
      { onConflict: "user_id" },
    );
    setSaving(false);
    if (error) toast({ title: "Failed", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Application submitted", description: "A super admin will review shortly." });
      setExisting({ status: "pending", motivation: motivation.trim(), review_notes: null, created_at: new Date().toISOString() });
    }
  };

  if (loading) return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-8 h-14 flex items-center gap-3">
          <BrandLink />
          <span className="text-muted-foreground">/</span>
           hover:text-foreground flex items-center gap-1.5 text-sm">
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 lg:px-8 py-8 max-w-2xl">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="text-gold" size={22} />
          <h1 className="text-2xl md:text-3xl font-display font-bold">Impact Lions Club</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-6">
          The charitable arm of AJBN. Members contribute £250/year to fund community initiatives, ESG projects and event fundraising.
        </p>

        {isLion ? (
          <div className="bg-gold/10 border border-gold/30 rounded-xl p-6 text-center">
            <Crown className="mx-auto text-gold mb-2" />
            <p className="font-semibold">You are an Impact Lion.</p>
            <p className="text-sm text-muted-foreground">Thank you for your support of the club.</p>
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
      </main>
    </div>
  );
}