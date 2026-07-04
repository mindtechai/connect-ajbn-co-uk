import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export function GoogleSignInButton({ next }: { next?: string }) {
  const [loading, setLoading] = useState(false);
  const onClick = async () => {
    setLoading(true);
    const redirect = `${window.location.origin}${next ? `?next=${encodeURIComponent(next)}` : ""}`;
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: redirect });
    if ((res as any)?.error) {
      setLoading(false);
      toast({ title: "Google sign-in failed", description: String((res as any).error?.message ?? (res as any).error), variant: "destructive" });
    }
  };
  return (
    <Button type="button" variant="outline" className="w-full gap-2" onClick={onClick} disabled={loading}>
      {loading ? <Loader2 className="animate-spin" size={16} /> : (
        <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C33.9 6.1 29.2 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.2 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C33.9 6.1 29.2 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"/>
          <path fill="#4CAF50" d="M24 44c5.1 0 9.8-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9.6 39.6 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.2 5.2c-.4.4 6.6-4.8 6.6-14.2 0-1.2-.1-2.4-.4-3.5z"/>
        </svg>
      )}
      Continue with Google
    </Button>
  );
}