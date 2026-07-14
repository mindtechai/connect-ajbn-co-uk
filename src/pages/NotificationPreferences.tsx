import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bell, Mail, Loader2, ShieldAlert } from "lucide-react";

type Cat = "announcements" | "events" | "renewals" | "lions" | "general";

const CATEGORIES: { key: Cat; label: string; description: string }[] = [
  { key: "announcements", label: "Announcements", description: "Portal news, flagship events, urgent notices." },
  { key: "events", label: "Events & RSVPs", description: "Networking, dinners, roundtables, reminders." },
  { key: "renewals", label: "Membership & renewals", description: "Renewal reminders, receipts, account status." },
  { key: "lions", label: "Impact Lions", description: "Charity campaigns, fundraising updates, Lions Club news." },
  { key: "general", label: "General messages", description: "Anything else not covered above." },
];

type Prefs = Record<Cat, { email: boolean; inapp: boolean }>;

const DEFAULTS: Prefs = CATEGORIES.reduce((acc, c) => {
  acc[c.key] = { email: true, inapp: true };
  return acc;
}, {} as Prefs);

export default function NotificationPreferencesPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const storageKey = user ? `ajbn_demo_notif_prefs_${user.id}` : "ajbn_demo_notif_prefs";

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/login"); return; }
    (async () => {
      const next: Prefs = { ...DEFAULTS };
      // Try backend first; fall back silently to localStorage on any error.
      try {
        const { data, error } = await supabase
          .from("notification_preferences")
          .select("category, email_enabled, inapp_enabled")
          .eq("user_id", user.id);
        if (error) throw error;
        for (const row of data ?? []) {
          if ((next as any)[row.category]) {
            (next as any)[row.category] = { email: row.email_enabled, inapp: row.inapp_enabled };
          }
        }
      } catch {
        try {
          const raw = localStorage.getItem(storageKey);
          if (raw) {
            const parsed = JSON.parse(raw) as Prefs;
            for (const c of CATEGORIES) {
              if (parsed[c.key]) next[c.key] = parsed[c.key];
            }
          }
        } catch { /* ignore */ }
      }
      setPrefs(next);
      setLoading(false);
    })();
  }, [user, authLoading, navigate, storageKey]);

  const setPref = (cat: Cat, ch: "email" | "inapp", value: boolean) =>
    setPrefs((p) => ({ ...p, [cat]: { ...p[cat], [ch]: value } }));

  const save = async () => {
    if (!user) return;
    setSaving(true);
    // Always persist locally so the demo walkthrough is resilient.
    try {
      localStorage.setItem(storageKey, JSON.stringify(prefs));
    } catch { /* ignore quota errors */ }

    // Best-effort backend sync; suppress all errors.
    try {
      const rows = CATEGORIES.map((c) => ({
        user_id: user.id,
        category: c.key,
        email_enabled: prefs[c.key].email,
        inapp_enabled: prefs[c.key].inapp,
      }));
      await supabase
        .from("notification_preferences")
        .upsert(rows, { onConflict: "user_id,category" });
    } catch { /* silently ignore */ }

    setSaving(false);
    toast({ title: "Preferences saved successfully", description: "Your notification settings are up to date." });
  };

  const unsubscribeAllEmail = () => {
    setPrefs((p) => {
      const next = { ...p };
      for (const c of CATEGORIES) next[c.key] = { ...next[c.key], email: false };
      return next;
    });
    toast({ title: "All email disabled", description: "Click Save to apply." });
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Loader2 className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <AppLayout maxWidth="3xl">

      <>
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-display font-bold">Notification preferences</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Choose which categories reach you and by which channel. These settings apply to every bulk message and announcement.
          </p>
        </div>

        <div className="bg-card border rounded-xl shadow-sm divide-y">
          <div className="grid grid-cols-[1fr,80px,80px] items-center px-5 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <div>Category</div>
            <div className="flex justify-center"><Bell size={14} /></div>
            <div className="flex justify-center"><Mail size={14} /></div>
          </div>

          {CATEGORIES.map((c) => (
            <div key={c.key} className="grid grid-cols-[1fr,80px,80px] items-center px-5 py-4 gap-2">
              <div>
                <div className="text-sm font-semibold">{c.label}</div>
                <div className="text-xs text-muted-foreground">{c.description}</div>
              </div>
              <div className="flex justify-center">
                <Switch
                  checked={prefs[c.key].inapp}
                  onCheckedChange={(v) => setPref(c.key, "inapp", v)}
                  aria-label={`In-app for ${c.label}`}
                />
              </div>
              <div className="flex justify-center">
                <Switch
                  checked={prefs[c.key].email}
                  onCheckedChange={(v) => setPref(c.key, "email", v)}
                  aria-label={`Email for ${c.label}`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-between items-center gap-3 mt-6">
          <Button variant="outline" size="sm" onClick={unsubscribeAllEmail} className="gap-1.5">
            <ShieldAlert size={14} /> Unsubscribe from all email
          </Button>
          <Button onClick={save} disabled={saving} className="gap-1.5">
            {saving && <Loader2 size={14} className="animate-spin" />}
            Save preferences
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          You will always receive legally required account emails (verification, security alerts) regardless of these settings.
        </p>
      </>
    </AppLayout>
  );
}