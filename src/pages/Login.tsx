import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-hero-pattern items-center justify-center p-12">
        <div className="max-w-md">
          <p className="font-display text-3xl font-bold text-primary-foreground leading-tight mb-4">
            Welcome back to <span className="text-gradient-gold">AJBN</span>
          </p>
          <p className="text-primary-foreground/60 leading-relaxed">
            Sign in to access your member dashboard, connect with fellow professionals, and manage your referrals.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <img src={ajbnLogo.url} alt="AJBN" className="h-10 w-10 rounded-md object-cover" />
            <span className="font-display text-2xl font-bold text-primary">AJBN</span>
          </Link>
          <p className="text-muted-foreground text-sm mb-8">Sign in to your member account</p>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button className="w-full" size="lg">Sign In</Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Not a member?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Apply to join
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
