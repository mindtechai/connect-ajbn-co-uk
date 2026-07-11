import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Copy, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { DeleteAccountDialog } from "@/components/DeleteAccountDialog";

const TAG_SUGGESTIONS = ["Barrister","Solicitor","Accountant","IFA","Funder","Property Consultant","Business Coach","Architect"];

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    first_name: "", last_name: "", company: "", title: "",
    industry: "", phone: "", linkedin: "", bio: "", email: "",
    referral_code: "", avatar_url: "", tags: [] as string[],
  });
  const [uploading, setUploading] = useState(false);
  const [tagDraft, setTagDraft] = useState("");

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
          avatar_url: (data as any).avatar_url ?? "",
          tags: Array.isArray((data as any).tags) ? (data as any).tags : [],
        });
      }
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  const uploadAvatar = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    if (error) { setUploading(false); toast({ title: "Upload failed", description: error.message, variant: "destructive" }); return; }
    const { data: signed } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 365);
    const url = signed?.signedUrl ?? "";
    await supabase.from("profiles").update({ avatar_url: url } as any).eq("id", user.id);
    setForm((p) => ({ ...p, avatar_url: url }));
    setUploading(false);
    toast({ title: "Avatar updated" });
  };

  const normalizeLinkedIn = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed === "") return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

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
      linkedin: normalizeLinkedIn(form.linkedin),
      bio: form.bio,
      tags: form.tags,
    } as any).eq("id", user.id);
    setSaving(false);
    if (error) toast({ title: "Save failed", description: error.message, variant: "destructive" });
    else toast({ title: "Profile updated" });
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const addTag = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    setForm((p) => p.tags.includes(t) ? p : { ...p, tags: [...p.tags, t] });
    setTagDraft("");
  };
  const removeTag = (t: string) => setForm((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }));

  return (
    <AppLayout maxWidth="2xl">

      <>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">Your profile</h1>
        <p className="text-sm text-muted-foreground mb-6">Kept private within the AJBN member network.</p>

        <div className="bg-card border rounded-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-4 pb-4 border-b">
            <div className="h-16 w-16 rounded-full bg-muted overflow-hidden flex items-center justify-center text-lg font-semibold text-muted-foreground">
              {form.avatar_url ? <img src={form.avatar_url} alt="" className="h-full w-full object-cover" /> : (form.first_name[0] ?? "?")}
            </div>
            <div>
              <label className="inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer text-primary hover:underline">
                <Upload size={14} />
                {uploading ? "Uploading…" : "Upload photo"}
                <input type="file" accept="image/*" hidden disabled={uploading}
                  onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
              </label>
              <p className="text-xs text-muted-foreground">JPG / PNG, max 5MB.</p>
            </div>
          </div>
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

          <div className="space-y-2">
            <Label>Professional tags</Label>
            <p className="text-xs text-muted-foreground -mt-1">Keywords shown on your profile and searched in the directory.</p>
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1">
                  {t}
                  <button type="button" onClick={() => removeTag(t)} aria-label={`Remove ${t}`} className="hover:text-destructive">
                    <X size={10} />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagDraft); }
                }}
                placeholder="Type a tag and press Enter"
              />
              <Button type="button" variant="outline" onClick={() => addTag(tagDraft)}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {TAG_SUGGESTIONS.filter((s) => !form.tags.includes(s)).map((s) => (
                <button key={s} type="button" onClick={() => addTag(s)}
                  className="text-[11px] px-2 py-0.5 rounded-full border border-dashed text-muted-foreground hover:text-foreground hover:border-solid">
                  + {s}
                </button>
              ))}
            </div>
          </div>

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

        <div className="mt-8 border border-destructive/40 rounded-xl p-6 bg-destructive/5">
          <h2 className="text-lg font-semibold text-destructive mb-1">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all associated data. This cannot be undone.
          </p>
          <DeleteAccountDialog />
        </div>
      </>
    </AppLayout>
  );
}