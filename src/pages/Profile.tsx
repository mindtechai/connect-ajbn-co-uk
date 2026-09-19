import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@/lib/router-compat";
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
// Kept so the dashboard / enquiry pre-fill keep working from the same cache.
const PROFILE_KEY = "ajbn_demo_profile";
const AVATAR_KEY = "ajbn_demo_avatar";

type ProfileForm = {
  first_name: string; last_name: string; title: string; industry: string;
  phone: string; linkedin: string; bio: string; tags: string[];
};

const EMPTY_FORM: ProfileForm = {
  first_name: "", last_name: "", title: "", industry: "",
  phone: "", linkedin: "", bio: "", tags: [],
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  // `saved` is the last persisted snapshot; `form` is the draft the member edits.
  // The draft is never overwritten by background auth refreshes or re-renders.
  const [saved, setSaved] = useState<ProfileForm>(EMPTY_FORM);
  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [readOnly, setReadOnly] = useState({ email: "", company: "", referral_code: "" });
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  // Loads exactly once per mount: focus/visibility auth refreshes replace the
  // `user` object, and re-running the load would wipe unsaved edits.
  const loadedRef = useRef(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    if (loadedRef.current) return;
    loadedRef.current = true;
    const userId = user.id;
    const meta = (user as { user_metadata?: Record<string, string> }).user_metadata ?? {};
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name, last_name, title, industry, phone, linkedin, bio, tags, company, email, referral_code")
        .eq("id", userId)
        .maybeSingle();
      if (error) {
        toast({ title: "Could not load your profile", description: error.message, variant: "destructive" });
      }
      const next: ProfileForm = {
        first_name: data?.first_name ?? meta["first_name"] ?? "",
        last_name: data?.last_name ?? meta["last_name"] ?? "",
        title: data?.title ?? "",
        industry: data?.industry ?? "",
        phone: data?.phone ?? "",
        linkedin: data?.linkedin ?? "",
        bio: data?.bio ?? "",
        tags: Array.isArray(data?.tags) ? (data?.tags as string[]) : [],
      };
      setSaved(next);
      setForm(next);
      setReadOnly({
        email: data?.email ?? user.email ?? "",
        company: data?.company ?? meta["company"] ?? "",
        referral_code: data?.referral_code ?? "",
      });
      try { setAvatarUrl(localStorage.getItem(AVATAR_KEY) ?? ""); } catch { /* storage unavailable */ }
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  const uploadAvatar = async (file: File) => {
    setUploading(true);
    try {
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      setAvatarUrl(dataUrl);
      try { localStorage.setItem(AVATAR_KEY, dataUrl); } catch { /* storage unavailable */ }
      toast({ title: "Photo updated" });
    } catch (e) {
      toast({ title: "Upload failed", description: e instanceof Error ? e.message : "Try a smaller image.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const normalizeLinkedIn = (value: string): string => {
    const trimmed = value.trim();
    if (trimmed === "") return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const payload: ProfileForm = { ...form, linkedin: normalizeLinkedIn(form.linkedin) };
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: payload.first_name.trim() || null,
        last_name: payload.last_name.trim() || null,
        title: payload.title.trim() || null,
        industry: payload.industry.trim() || null,
        phone: payload.phone.trim() || null,
        linkedin: payload.linkedin || null,
        bio: payload.bio.trim() || null,
        tags: payload.tags,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    setSaved(payload);
    setForm(payload);
    setEditing(false);
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify({ ...payload, ...readOnly, avatar_url: avatarUrl }));
    } catch { /* storage unavailable */ }
    toast({ title: "Profile updated", description: "Your changes have been saved." });
  };

  const cancel = () => {
    setForm(saved);
    setTagDraft("");
    setEditing(false);
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  const set = (k: "first_name" | "last_name" | "title" | "industry" | "phone" | "linkedin" | "bio") =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  const addTag = (raw: string) => {
    const t = raw.trim();
    if (!t) return;
    setForm((p) => (p.tags.includes(t) ? p : { ...p, tags: [...p.tags, t] }));
    setTagDraft("");
  };
  const removeTag = (t: string) => setForm((p) => ({ ...p, tags: p.tags.filter((x) => x !== t) }));

  return (
    <AppLayout maxWidth="2xl">
      <>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">Your profile</h1>
        <p className="text-sm text-muted-foreground mb-2">Kept private within the AJBN member network.</p>
        <p className="text-sm mb-6">
          <Link to="/member-portal" className="text-primary hover:underline">
            Manage your business profile in the Member Portal →
          </Link>
        </p>

        <div className="bg-card border rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between gap-3 pb-4 border-b">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted overflow-hidden flex items-center justify-center text-lg font-semibold text-muted-foreground">
                {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : (form.first_name[0] ?? "?")}
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
            {!editing && (
              <Button type="button" variant="outline" onClick={() => setEditing(true)}>Edit profile</Button>
            )}
          </div>

          {!editing && (
            <p className="text-xs text-muted-foreground -mt-1">
              Tap “Edit profile” to change your details. Nothing is saved until you press Save changes.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>First name</Label><Input value={form.first_name} onChange={set("first_name")} disabled={!editing} /></div>
            <div className="space-y-2"><Label>Last name</Label><Input value={form.last_name} onChange={set("last_name")} disabled={!editing} /></div>
          </div>
          <div className="space-y-2"><Label>Email</Label><Input value={readOnly.email} disabled /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Company</Label>
              <Input value={readOnly.company} disabled />
              <p className="text-xs text-muted-foreground">Change your company name in the Member Portal (admin approved).</p>
            </div>
            <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={set("title")} disabled={!editing} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Industry</Label><Input value={form.industry} onChange={set("industry")} disabled={!editing} placeholder="Finance, Property, Legal…" /></div>
            <div className="space-y-2"><Label>Phone</Label><Input value={form.phone} onChange={set("phone")} disabled={!editing} /></div>
          </div>
          <div className="space-y-2"><Label>LinkedIn</Label><Input value={form.linkedin} onChange={set("linkedin")} disabled={!editing} placeholder="https://linkedin.com/in/…" /></div>
          <div className="space-y-2"><Label>Bio</Label><Textarea value={form.bio} onChange={set("bio")} rows={4} disabled={!editing} placeholder="Short professional bio…" /></div>

          <div className="space-y-2">
            <Label>Professional tags</Label>
            <p className="text-xs text-muted-foreground -mt-1">Keywords shown on your profile and searched in the directory.</p>
            <div className="flex flex-wrap gap-1.5">
              {form.tags.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1">
                  {t}
                  {editing && (
                    <button type="button" onClick={() => removeTag(t)} aria-label={`Remove ${t}`} className="hover:text-destructive">
                      <X size={10} />
                    </button>
                  )}
                </Badge>
              ))}
              {form.tags.length === 0 && <span className="text-xs text-muted-foreground">No tags yet.</span>}
            </div>
            {editing && (
              <>
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
              </>
            )}
          </div>

          {readOnly.referral_code && (
            <div className="pt-4 border-t space-y-2">
              <Label>Your referral code</Label>
              <div className="flex gap-2">
                <Input value={readOnly.referral_code} readOnly className="font-mono" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(readOnly.referral_code);
                    toast({ title: "Copied", description: readOnly.referral_code });
                  }}
                >
                  <Copy size={14} />
                </Button>
              </div>
            </div>
          )}

          {editing && (
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={cancel} disabled={saving}>Cancel</Button>
              <Button onClick={save} disabled={saving} className="gap-1.5">
                {saving && <Loader2 size={14} className="animate-spin" />} Save changes
              </Button>
            </div>
          )}
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
