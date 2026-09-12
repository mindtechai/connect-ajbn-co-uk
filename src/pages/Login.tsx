import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";
import { assetUrl } from "@/lib/asset";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { ReferrerCombobox } from "@/components/ReferrerCombobox";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"register" | "signin">("signin");

  // Sign-in fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Registration fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referredBy, setReferredBy] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/dashboard";

  useEffect(() => {
    const verificationEmail = params.get("email");
    if (params.get("verification") === "1") setNeedsVerification(true);
    if (verificationEmail) setEmail(verificationEmail);
  }, [params]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => setResendCooldown((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const resendVerification = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) {
      toast({ title: "Enter your email", description: "Add the email address you registered with first.", variant: "destructive" });
      return;
    }
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: targetEmail,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    setResending(false);
    if (error) {
      const seconds = Number(error.message.match(/after\s+(\d+)\s+seconds?/i)?.[1] ?? 60);
      if (error.code === "over_email_send_rate_limit" || /rate limit|request this after/i.test(error.message)) {
        setResendCooldown(seconds);
        toast({ title: "Please wait before trying again", description: `You can request another verification email in ${seconds} seconds.` });
        return;
      }
      toast({ title: "Could not resend email", description: error.message, variant: "destructive" });
      return;
    }
    setResendCooldown(60);
    toast({ title: "Verification email sent", description: "Check your inbox and spam folder, then use the link to confirm your account." });
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    localStorage.removeItem("ajbn_demo_mock_user");
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setLoading(false);
      if (error.code === "email_not_confirmed" || /email not confirmed/i.test(error.message)) {
        setNeedsVerification(true);
        toast({ title: "Verify your email to sign in", description: "Use the link in your verification email, or request a new one below." });
        return;
      }
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Welcome to AJBN Connect" });
    window.location.href = next.startsWith("/") ? next : "/dashboard";
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", description: "Please check your password and confirm it.", variant: "destructive" });
      return;
    }
    if (password.length < 8) {
      toast({ title: "Password too short", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    setLoading(true);
    localStorage.removeItem("ajbn_demo_mock_user");
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          company: company.trim(),
          referred_by: referredBy || undefined,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
      return;
    }
    if (!data.session) {
      toast({
        title: "Check your email",
        description: "Use the verification link we sent before signing in.",
      });
      setNeedsVerification(true);
      setMode("signin");
      return;
    }
    toast({ title: "Welcome to AJBN Connect", description: "Your account is ready." });
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-pattern items-center justify-center p-12">
        <div className="max-w-md">
          <p className="font-display text-3xl font-bold text-primary-foreground leading-tight mb-4">
            Welcome to the <span className="text-gradient-gold">New AJBN Connect</span>
          </p>
          <p className="text-primary-foreground/60 leading-relaxed">
            Register your fresh account to unlock your member profile, direct messaging, and the full AJBN network.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <img src={assetUrl(ajbnLogo)} alt="AJBN" className="h-10 w-10 rounded-md object-cover" />
            <span className="font-display text-2xl font-bold text-primary">AJBN</span>
          </Link>

          <h1 className="font-display text-2xl font-bold text-foreground mt-2">
            Welcome to the New AJBN Connect Portal
          </h1>
          <p className="text-muted-foreground text-sm mt-2 mb-6">
            {mode === "signin"
              ? "Sign in with your AJBN Connect account. New here? You can register a fresh account below."
              : "New to the portal? Create your AJBN Connect account to activate your profile and messaging."}
          </p>

          {mode === "register" ? (
            <form className="space-y-5" onSubmit={handleRegister}>
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
                <Label htmlFor="company">Company (optional)</Label>
                <Input id="company" placeholder="Your company name" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" type={showPassword ? "text" : "password"} placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>Who referred you to AJBN? (optional)</Label>
                <ReferrerCombobox value={referredBy} onChange={setReferredBy} />
              </div>

              <Button className="w-full" size="lg" disabled={loading}>
                {loading ? "Creating account…" : "Register / Create Account"}
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Already registered your new account?{" "}
                <button type="button" onClick={() => setMode("signin")} className="text-primary font-medium hover:underline">
                  Sign In here
                </button>
              </p>

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <GoogleSignInButton next={next} />
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleSignIn}>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button className="w-full" size="lg" disabled={loading}>
                {loading ? "Signing in…" : "Sign In"}
              </Button>

              {needsVerification && (
                <div className="rounded-md border bg-muted/40 p-4 space-y-3" role="status">
                  <div>
                    <p className="text-sm font-medium">Email verification required</p>
                    <p className="mt-1 text-xs text-muted-foreground">Check your inbox and spam folder for the verification link. If it has expired or is missing, request a new one.</p>
                  </div>
                  <Button type="button" variant="outline" className="w-full" onClick={() => void resendVerification()} disabled={resending || resendCooldown > 0}>
                    {resending ? "Sending…" : resendCooldown > 0 ? `Resend available in ${resendCooldown}s` : "Resend verification email"}
                  </Button>
                </div>
              )}

              <p className="text-sm text-muted-foreground text-center">
                Need to create an account?{" "}
                <button type="button" onClick={() => setMode("register")} className="text-primary font-medium hover:underline">
                  Register here
                </button>
              </p>

              <div className="my-4 flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="h-px flex-1 bg-border" />
              </div>
              <GoogleSignInButton next={next} />
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
