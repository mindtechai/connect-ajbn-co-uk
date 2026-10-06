import { useEffect, useState } from "react";
import { useNavigate } from "@/lib/router-compat";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { isAppleUser, appleFullName, splitName } from "@/lib/apple-identity";

export default function CompleteProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const apple = isAppleUser(user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [business, setBusiness] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    if (authLoading || !user) return;
    (async () => {
      const [{ data: p }, { data: tax }] = await Promise.all([
        supabase.from("profiles").select("first_name, last_name, company, pending_company_name, primary_sector").eq("id", user.id).maybeSingle(),
        supabase.from("service_taxonomy").select("name").eq("is_active", true).order("sort_order"),
      ]);
      const meta = (user.user_metadata ?? {}) as Record<string, string>;
      const fromApple = splitName(appleFullName(user));
      setFirst(p?.first_name || meta["first_name"] || fromApple.first);
      setLast(p?.last_name || meta["last_name"] || fromApple.last);
      setBusiness(p?.pending_company_name || p?.company || "");
      setCategory(p?.primary_sector || "");
      const names = (tax ?? []).map((t) => t.name);
      if (p?.primary_sector && !names.includes(p.primary_sector)) names.unshift(p.primary_sector);
      setCategories(names.length ? names : ["Other"]);
      setLoading(false);
    })();
  }, [user, authLoading]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!business.trim() || !category) {
      toast({ title: "Please add your business name and service category", variant: "destructive" });
      return;
    }
    if (!apple && !first.trim()) {
      toast({ title: "Please add your first name", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { data: row } = await supabase.from("profiles").select("company").eq("id", user.id).maybeSingle();
    const patch: Record<string, unknown> = {
      first_name: first.trim() || null,
      last_name: last.trim() || null,
      primary_sector: category,
    };
    const name = business.trim();
    if (!(row?.company ?? "").trim()) {
      // First business name is saved straight away.
      patch["company"] = name;
    } else if (name !== row?.company) {
      // Later changes go through the existing admin approval path.
      patch["pending_company_name"] = name;
      patch["company_name_status"] = "pending";
    }
    const { error } = await supabase.from("profiles").update(patch as never).eq("id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Profile saved", description: "Thanks — you're all set." });
    navigate("/dashboard");
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;
  }

  const fullName = [first, last].filter(Boolean).join(" ");

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold">Complete your profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Just two quick details about your business.</p>

        <form onSubmit={save} className="mt-6 space-y-5">
          {apple ? (
            <div className="rounded-lg border bg-muted/40 p-3 text-sm break-all" aria-readonly="true">
              Signed in as <span className="font-medium">{fullName || "Apple member"}</span>
              {user?.email ? <> · <span className="text-muted-foreground">{user.email}</span></> : null}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label htmlFor="cp-first">First name</Label><Input id="cp-first" value={first} onChange={(e) => setFirst(e.target.value)} required /></div>
                <div className="space-y-2"><Label htmlFor="cp-last">Last name</Label><Input id="cp-last" value={last} onChange={(e) => setLast(e.target.value)} /></div>
              </div>
              <div className="space-y-2"><Label>Email</Label><Input value={user?.email ?? ""} disabled /></div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="cp-business">Business name</Label>
            <Input id="cp-business" value={business} onChange={(e) => setBusiness(e.target.value)} required placeholder="Your company name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cp-category">Service category</Label>
            <select
              id="cp-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Choose a category…</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? <Loader2 className="animate-spin" size={16} /> : "Save"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => navigate("/dashboard")}>Later</Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
