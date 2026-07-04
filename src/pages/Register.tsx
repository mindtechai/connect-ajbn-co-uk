import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);

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
          <Link to="/" className="flex items-center gap-2 mb-2">
            <img src={ajbnLogo.url} alt="AJBN" className="h-10 w-10 rounded-md object-cover" />
            <span className="font-display text-2xl font-bold text-primary">AJBN</span>
          </Link>
          <p className="text-muted-foreground text-sm mb-8">Apply for membership</p>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" placeholder="David" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" placeholder="Patel" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" placeholder="Your company name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min 8 characters" />
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
              <Input id="referral" placeholder="Enter code from referring member" />
            </div>

            <Button className="w-full" size="lg">Submit Application</Button>
          </form>

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
