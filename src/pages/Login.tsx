import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";
import { assetUrl } from "@/lib/asset";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";

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

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      return;
    }
    navigate(next);
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
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          first_name: firstName,
          last_name: lastName,
          company,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Registration failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Account created", description: "Check your email to confirm your account, then sign in." });
    setMode("signin");
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
