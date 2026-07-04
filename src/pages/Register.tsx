import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";
import impactLionsLogo from "@/assets/impact-lions-logo.png.asset.json";
import { assetUrl } from "@/lib/asset";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const code = referral.trim().toUpperCase();
    if (code) {
      const { data: valid, error: rpcErr } = await supabase.rpc("referral_code_exists", { _code: code });
      if (rpcErr || !valid) {
        setLoading(false);
        toast({ title: "Invalid referral code", description: "That code doesn't match any AJBN member. Leave blank if you don't have one.", variant: "destructive" });
        return;
      }
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          first_name: firstName,
          last_name: lastName,
          company,
          referred_by_code: code || undefined,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Application submitted", description: "Check your email to confirm your account." });
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-pattern items-center justify-center p-12">
        <div className="max-w-md">
          <p className="font-display text-3xl font-bold text-primary-foreground leading-tight mb-4">
            Join the <span className="text-gradient-gold">AJBN</span>
          </p>
          <p className="text-primary-foreground/60 leading-relaxed">
            Apply for membership to access the UK's premier Asian-Jewish business community.
            Connect with professionals across finance, property, legal, and tech.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-2">
            <Link to="/" className="flex items-center gap-2">
              <img src={assetUrl(ajbnLogo)} alt="AJBN" className="h-10 w-10 rounded-md object-cover" />
              <span className="font-display text-2xl font-bold text-primary">AJBN</span>
            </Link>
            <a href="/#impact-lions" aria-label="AJBN Impact Lions Club section">
              <img src={assetUrl(impactLionsLogo)} alt="AJBN Impact Lions Club logo" className="h-12 w-12 object-contain hover:opacity-80 transition-opacity" />
            </a>
          </div>
          <p className="text-muted-foreground text-sm mb-8">Apply for membership</p>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="David" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Patel" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="Your company name" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referral">Referral Code (optional)</Label>
              <Input id="referral" placeholder="Enter code from referring member" value={referral} onChange={(e) => setReferral(e.target.value)} />
            </div>

            <Button className="w-full" size="lg" disabled={loading}>{loading ? "Submitting…" : "Submit Application"}</Button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <GoogleSignInButton />

          <p className="text-sm text-muted-foreground text-center mt-6">
            Already a member?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
