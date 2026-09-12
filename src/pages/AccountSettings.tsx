import { useEffect, useState } from "react";
import { Link } from "@/lib/router-compat";
import { KeyRound, Loader2, ArrowLeft, Moon } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { QUIET_HOURS_SCHEDULE, isUkQuietHours } from "@/lib/quietHours";

export default function AccountSettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [quietHours, setQuietHours] = useState(false);
  const [savingQuietHours, setSavingQuietHours] = useState(false);

  useEffect(() => {
    if (!user) return;
    void supabase
      .from("profiles")
      .select("quiet_hours_enabled")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setQuietHours(data?.quiet_hours_enabled ?? false));
  }, [user?.id]);

  const updateQuietHours = async (enabled: boolean) => {
    if (!user) return;
    const previous = quietHours;
    setQuietHours(enabled);
    setSavingQuietHours(true);
    const { error } = await supabase
      .from("profiles")
      .update({ quiet_hours_enabled: enabled })
      .eq("id", user.id);
    setSavingQuietHours(false);

    if (error) {
      setQuietHours(previous);
      toast({ title: "Could not update Quiet Hours", description: error.message, variant: "destructive" });
      return;
    }

    window.dispatchEvent(new CustomEvent("ajbn-quiet-hours-changed", { detail: { enabled } }));
    toast({
      title: enabled ? "Quiet Hours enabled" : "Quiet Hours disabled",
      description: enabled ? QUIET_HOURS_SCHEDULE : "In-app notifications will continue normally.",
    });
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.email) {
      toast({ title: "Account email unavailable", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (currentPassword === newPassword) {
      toast({ title: "Choose a different password", variant: "destructive" });
      return;
    }

    setSaving(true);
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (verifyError) {
      setSaving(false);
      toast({ title: "Current password is incorrect", description: "Your password was not changed.", variant: "destructive" });
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
    setSaving(false);
    if (updateError) {
      toast({ title: "Password update failed", description: updateError.message, variant: "destructive" });
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast({ title: "Password updated", description: "Use your new password the next time you sign in." });
  };

  return (
    <AppLayout>
      <main className="container mx-auto max-w-xl px-4 pb-24 pt-28 lg:px-8">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        <div className="border-b pb-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <KeyRound size={20} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Account settings</h1>
              <p className="text-sm text-muted-foreground">Manage your account and notification downtime.</p>
            </div>
          </div>
        </div>

        <section className="border-b py-6" aria-labelledby="quiet-hours-heading">
          <div className="flex items-start justify-between gap-5">
            <div className="flex min-w-0 gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <Moon size={20} aria-hidden="true" />
              </div>
              <div>
                <h2 id="quiet-hours-heading" className="font-semibold">Quiet Hours</h2>
                <p className="mt-1 text-sm text-muted-foreground">{QUIET_HOURS_SCHEDULE}</p>
                <p className="mt-2 text-sm">Inspired by Shabbat — time to rest &amp; recharge.</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  In-app alerts are muted during this time. Email remains unchanged.
                </p>
                {quietHours && isUkQuietHours() && (
                  <p className="mt-2 text-xs font-medium text-primary">Status: In Quiet Hours</p>
                )}
              </div>
            </div>
            <Switch
              checked={quietHours}
              onCheckedChange={(checked) => void updateQuietHours(checked)}
              disabled={savingQuietHours}
              aria-label="Quiet Hours"
            />
          </div>
        </section>

        <form onSubmit={submit} className="space-y-5 py-6">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input id="current-password" type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} maxLength={128} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input id="new-password" type="password" autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={8} maxLength={128} required />
            <p className="text-xs text-muted-foreground">Use at least 8 characters.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={8} maxLength={128} required />
          </div>
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
            Update Password
          </Button>
        </form>
      </main>
    </AppLayout>
  );
}