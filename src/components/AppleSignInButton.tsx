import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * Official-style black "Continue with Apple" button.
 * Requests name + email only and accepts Apple private relay addresses.
 */
export function AppleSignInButton({ next }: { next?: string }) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    setLoading(true);
    const redirect = `${window.location.origin}${next ? `?next=${encodeURIComponent(next)}` : ""}`;
    const res = await lovable.auth.signInWithOAuth("apple", { redirect_uri: redirect });
    if ((res as any)?.error) {
      setLoading(false);
      toast({
        title: "Apple sign-in failed",
        description: String((res as any).error?.message ?? (res as any).error),
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      type="button"
      className="w-full gap-2 bg-black text-white hover:bg-black/90"
      onClick={onClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={16} />
      ) : (
        <svg width="16" height="16" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true">
          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C61.4 141.5 8 184.1 8 271.6c0 26 4.8 52.9 14.3 80.6 12.7 36.4 60 125.8 109.3 124.3 25.8-.6 44-18.3 77.6-18.3 32.6 0 49.5 17.7 78.2 17.7 49.7-.7 92.5-82 104-118.5-66.6-31.4-72.7-85.5-72.7-88.7zM255.7 78.5c19.5-23.7 29.2-51.5 27.2-83.5-31.2 1.8-57.7 18-78.2 41.8-19.7 22.7-30.5 50.1-28.5 80.5 32.4 2.6 59.5-13.1 79.5-38.8z" />
        </svg>
      )}
      Continue with Apple
    </Button>
  );
}
