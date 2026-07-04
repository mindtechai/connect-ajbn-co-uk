import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2, Copy } from "lucide-react";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "", last_name: "", company: "", title: "",
    industry: "", phone: "", linkedin: "", bio: "", email: "",
    referral_code: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    (async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (data) {
        setForm({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          company: data.company ?? "",
          title: (data as any).title ?? "",
          industry: (data as any).industry ?? "",
          phone: (data as any).phone ?? "",
          linkedin: (data as any).linkedin ?? "",
          bio: (data as any).bio ?? "",
          email: data.email ?? user.email ?? "",
          referral_code: (data as any).referral_code ?? "",
        });
      }
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      first_name: form.first_name,
      last_name: form.last_name,
      company: form.company,
      title: form.title,
      industry: form.industry,
      phone: form.phone,
      linkedin: form.linkedin,
      bio: form.bio,
    }).eq("id", user.id);
    setSaving(false);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else toast({ title: "Profile updated" });
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-8 h-14 flex items-center gap-3">
          <Link to="/dashboard" className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm">
            <ArrowLeft size={14} /> Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 lg:px-8 py-8 max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">Your profile</h1>
        <p className="text-sm text-muted-foreground mb-6">Kept private within the AJBN member network.</p>

        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>First name</Label><Input value={form.first_name} onChange={set("first_name")} /></div>
            <div className="space-y-2"><Label>Last name</Label><Input value={form.last_name} onChange={set("last_name")} /></div>
          </div>
          <div className="space-y-2"><Label>Email</Label><Input value={form.email} disabled /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Company</Label><Input value={form.company} onChange={set("company")} /></div>
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={set("title")} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Industry</Label><Input value={form.industry} onChange={set("industry")} placeholder="Finance, Property, Legal…" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={set("phone")} /></div>
          </div>
          <div className="space-y-2"><Label>LinkedIn</Label><Input value={form.linkedin} onChange={set("linkedin")} placeholder="https://linkedin.com/in/…" /></div>
          <div className="space-y-2"><Label>Bio</Label><Textarea value={form.bio} onChange={set("bio")} rows={4} placeholder="Short professional bio…" /></div>

          <div className="pt-4 border-t space-y-2">
            <Label>Your referral code</Label>
            <div className="flex gap-2">
              <Input value={form.referral_code} readOnly className="font-mono" />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(form.referral_code);
                  toast({ title: "Copied", description: form.referral_code });
                }}
              >
                <Copy size={14} />
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={save} disabled={saving} className="gap-1.5">
              {saving && <Loader2 size={14} className="animate-spin" />} Save changes
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}