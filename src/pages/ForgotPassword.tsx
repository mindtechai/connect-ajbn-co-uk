import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";
import { assetUrl } from "@/lib/asset";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Could not send email", description: error.message, variant: "destructive" });
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background px-4">
      <div className="w-full max-w-sm bg-card border rounded-2xl p-8 shadow-sm">
        <Link to="/" className="flex items-center gap-2 mb-2">
          <img src={assetUrl(ajbnLogo)} alt="AJBN" className="h-10 w-10 rounded-md object-cover" />
          <span className="font-display text-2xl font-bold text-primary">AJBN</span>
        </Link>
        <h1 className="font-display text-xl font-semibold mt-4">Reset your password</h1>

        {sent ? (
          <div className="mt-6 text-center space-y-3">
            <CheckCircle2 className="mx-auto text-teal" size={40} />
            <p className="text-sm text-muted-foreground">
              If an account exists for <span className="font-medium text-foreground">{email}</span>, we've sent a reset link. Check your inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <Button className="w-full" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</Button>
          </form>
        )}

        <Link to="/login" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mt-6">
          <ArrowLeft size={12} /> Back to sign in
        </Link>
      </div>
    </div>
  );
}