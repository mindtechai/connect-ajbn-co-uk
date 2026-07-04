import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase places the recovery session in the URL hash; onAuthStateChange fires with PASSWORD_RECOVERY
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    // Fallback: if a session is already present (link followed), allow updating
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else if (!window.location.hash.includes("type=recovery")) setInvalid(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Password updated", description: "You're signed in with your new password." });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4">
      <div className="w-full max-w-sm bg-card border rounded-2xl p-8 shadow-sm">
        <Link to="/" className="flex items-center gap-2 mb-2">
          <img src={ajbnLogo.url} alt="AJBN" className="h-10 w-10 rounded-md object-cover" />
          <span className="font-display text-2xl font-bold text-primary">AJBN</span>
        </Link>
        <h1 className="font-display text-xl font-semibold mt-4">Choose a new password</h1>

        {invalid ? (
          <p className="text-sm text-muted-foreground mt-6">
            This reset link is invalid or has expired.{" "}
            <Link to="/forgot-password" className="text-primary hover:underline">Request a new one</Link>.
          </p>
        ) : !ready ? (
          <div className="py-6 text-center"><Loader2 className="animate-spin text-muted-foreground mx-auto" /></div>
        ) : (
          <form onSubmit={submit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="pw">New password</Label>
              <Input id="pw" type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw2">Confirm password</Label>
              <Input id="pw2" type="password" minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>
            <Button className="w-full" disabled={loading}>{loading ? "Updating…" : "Update password"}</Button>
          </form>
        )}
      </div>
    </div>
  );
}