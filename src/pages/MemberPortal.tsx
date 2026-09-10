import { useCallback, useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Clock, Loader2, Upload } from "lucide-react";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

type ProfileRow = {
  company: string | null;
  website: string | null;
  logo_url: string | null;
  pending_company_name: string | null;
  pending_website: string | null;
  pending_logo_url: string | null;
  company_name_status: string;
  website_status: string;
  logo_status: string;
  bio: string | null;
  phone: string | null;
  address: string | null;
  linkedin_url: string | null;
  other_socials: string | null;
};

function PendingBadge() {
  return (
    <Badge className="text-xs bg-gold/10 text-gold border-gold/20">
      <Clock size={12} className="mr-1" /> Pending admin approval
    </Badge>
  );
}

export default function MemberPortalPage() {
  const { user, roles, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [row, setRow] = useState<ProfileRow | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [liveLogo, setLiveLogo] = useState<string | null>(null);
  const [form, setForm] = useState({
    company: "", website: "", bio: "", phone: "",
    address: "", linkedin_url: "", other_socials: "",
  });

  const isApproved = roles.some((r) =>
    r === "ajbn_member" || r === "impact_lion" || r === "super_admin");

  const signedUrl = useCallback(async (path: string | null) => {
    if (!path) return null;
    const { data } = await supabase.storage.from("member-logos").createSignedUrl(path, 600);
    return data?.signedUrl ?? null;
  }, []);

  useEffect(() => {
    if (authLoading || !user || !isApproved) { if (!authLoading) setLoading(false); return; }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("company, website, logo_url, pending_company_name, pending_website, pending_logo_url, company_name_status, website_status, logo_status, bio, phone, address, linkedin_url, other_socials")
        .eq("id", user.id)
        .maybeSingle();
      const r = (data ?? null) as ProfileRow | null;
      setRow(r);
      setForm({
        company: r?.pending_company_name ?? r?.company ?? "",
        website: r?.pending_website ?? r?.website ?? "",
        bio: r?.bio ?? "",
        phone: r?.phone ?? "",
        address: r?.address ?? "",
        linkedin_url: r?.linkedin_url ?? "",
        other_socials: r?.other_socials ?? "",
      });
      setLiveLogo(await signedUrl(r?.logo_url ?? null));
      setLogoPreview(await signedUrl(r?.pending_logo_url ?? null));
      setLoading(false);
    })();
  }, [user, authLoading, isApproved, signedUrl]);

  const saveInstant = async (patch: Partial<ProfileRow>) => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
    if (error) toast({ title: "Could not save", description: error.message, variant: "destructive" });
  };

  const uploadLogo = async (file: File) => {
    if (!user) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({ title: "Unsupported file", description: "Please upload a JPG or PNG image.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      toast({ title: "File too large", description: "Logos must be 2MB or smaller.", variant: "destructive" });
      return;
    }
    setUploading(true);
    setLogoPreview(URL.createObjectURL(file));
    const ext = file.type === "image/png" ? "png" : "jpg";
    const path = `${user.id}/logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("member-logos").upload(path, file, { upsert: true });
    if (error) {
      setUploading(false);
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return;
    }
    await supabase.from("profiles")
      .update({ pending_logo_url: path, logo_status: "pending" })
      .eq("id", user.id);
    setRow((prev) => prev ? { ...prev, pending_logo_url: path, logo_status: "pending" } : prev);
    setUploading(false);
    toast({ title: "Profile updated — logo pending approval" });
  };

  const handleSave = async () => {
    if (!user || !row) return;
    setSaving(true);
    const patch: Record<string, unknown> = {
      bio: form.bio || null,
      phone: form.phone || null,
      address: form.address || null,
      linkedin_url: form.linkedin_url || null,
      other_socials: form.other_socials || null,
    };
    const pendingLabels: string[] = [];

    const companyChanged = form.company.trim() !== (row.company ?? "");
    if (companyChanged) {
      patch["pending_company_name"] = form.company.trim() || null;
      patch["company_name_status"] = form.company.trim() ? "pending" : "approved";
      if (form.company.trim()) pendingLabels.push("company name");
    }
    const websiteChanged = form.website.trim() !== (row.website ?? "");
    if (websiteChanged) {
      patch["pending_website"] = form.website.trim() || null;
      patch["website_status"] = form.website.trim() ? "pending" : "approved";
      if (form.website.trim()) pendingLabels.push("website");
    }
    if (row.logo_status === "pending") pendingLabels.push("logo");

    const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    setRow({ ...row, ...(patch as Partial<ProfileRow>) } as ProfileRow);
    toast({
      title: pendingLabels.length
        ? `Profile updated — ${pendingLabels.join(", ")} pending approval`
        : "Profile updated",
    });
  };

  if (authLoading || loading) {
    return (
      <AppLayout maxWidth="2xl">
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
      </AppLayout>
    );
  }

  if (!isApproved) {
    return (
      <AppLayout maxWidth="2xl">
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">Member Portal</h1>
        <div className="bg-card border rounded-xl p-6 shadow-xs">
          <p className="text-sm text-muted-foreground">
            Your membership is awaiting approval. Once approved you'll be able to manage your
            business profile here.
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout maxWidth="2xl">
      <h1 className="text-2xl md:text-3xl font-display font-bold mb-1">Member Portal</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Manage your business profile. Company name, website and logo changes are reviewed by an admin
        before going live.
      </p>

      <div className="bg-card border rounded-xl p-6 shadow-xs space-y-6">
        {/* Logo */}
        <div className="space-y-3 pb-6 border-b">
          <div className="flex items-center gap-2">
            <Label>Company logo</Label>
            {row?.logo_status === "pending" && <PendingBadge />}
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="h-20 w-20 rounded-lg border bg-muted overflow-hidden flex items-center justify-center">
                {liveLogo ? <img src={liveLogo} alt="Current company logo" className="h-full w-full object-contain" />
                  : <span className="text-xs text-muted-foreground">None</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Live</p>
            </div>
            {row?.logo_status === "pending" && logoPreview && (
              <div className="text-center">
                <div className="h-20 w-20 rounded-lg border border-gold/40 bg-muted overflow-hidden flex items-center justify-center">
                  <img src={logoPreview} alt="Proposed company logo" className="h-full w-full object-contain" />
                </div>
                <p className="text-xs text-gold mt-1">Submitted</p>
              </div>
            )}
            <div>
              <label className="inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer text-primary hover:underline">
                <Upload size={14} />
                {uploading ? "Uploading…" : "Upload logo"}
                <input type="file" accept="image/jpeg,image/png" hidden disabled={uploading}
                  onChange={(e) => e.target.files?.[0] && uploadLogo(e.target.files[0])} />
              </label>
              <p className="text-xs text-muted-foreground">JPG / PNG, max 2MB. Your current logo stays live until approved.</p>
            </div>
          </div>
        </div>

        {/* Approval-gated text fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Label htmlFor="company">Company name</Label>
              {row?.company_name_status === "pending" && <PendingBadge />}
            </div>
            <Input id="company" value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })} />
            {row?.company_name_status === "pending" && (
              <p className="text-xs text-muted-foreground">Currently live: {row.company ?? "—"}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Label htmlFor="website">Website</Label>
              {row?.website_status === "pending" && <PendingBadge />}
            </div>
            <Input id="website" value={form.website} placeholder="https://"
              onChange={(e) => setForm({ ...form, website: e.target.value })} />
            {row?.website_status === "pending" && (
              <p className="text-xs text-muted-foreground">Currently live: {row.website ?? "—"}</p>
            )}
          </div>
        </div>

        {/* Instant fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              onBlur={() => saveInstant({ phone: form.phone || null })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" value={form.linkedin_url} placeholder="https://linkedin.com/in/…"
              onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
              onBlur={() => saveInstant({ linkedin_url: form.linkedin_url || null })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              onBlur={() => saveInstant({ address: form.address || null })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="socials">Other socials</Label>
            <Input id="socials" value={form.other_socials} placeholder="X, Instagram, Facebook…"
              onChange={(e) => setForm({ ...form, other_socials: e.target.value })}
              onBlur={() => saveInstant({ other_socials: form.other_socials || null })} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={4} value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              onBlur={() => saveInstant({ bio: form.bio || null })} />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 size={14} className="animate-spin mr-1" />} Save changes
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
