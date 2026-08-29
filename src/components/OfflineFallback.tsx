import { useCallback, useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// navigator.onLine reports false in embedded/preview contexts and during early
// hydration even when the network is fine, so never trust it alone: confirm with
// a real same-origin request before showing the blocking overlay.
async function reachable(): Promise<boolean> {
  try {
    await fetch(`/manifest.webmanifest?ping=${Date.now()}`, { cache: "no-store" });
    return true;
  } catch {
    return false;
  }
}

export function OfflineFallback() {
  const [offline, setOffline] = useState(false);

  const verify = useCallback(async () => {
    if (await reachable()) setOffline(false);
    else setOffline(!navigator.onLine);
  }, []);

  useEffect(() => {
    const onOffline = () => void verify();
    const onOnline = () => setOffline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    if (!navigator.onLine) void verify();
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [verify]);

  if (!offline) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-primary/95 backdrop-blur-xs grid place-items-center p-6">
      <div className="max-w-sm w-full bg-card border rounded-2xl p-8 text-center shadow-2xl">
        <div className="mx-auto w-14 h-14 rounded-full bg-muted grid place-items-center mb-4">
          <WifiOff className="text-muted-foreground" />
        </div>
        <h2 className="font-display text-xl font-bold mb-2">You&apos;re offline</h2>
        <p className="text-sm text-muted-foreground mb-6">
          AJBN Connect needs an internet connection. Check your Wi-Fi or mobile data and try again.
        </p>
        <Button onClick={() => void verify()} className="w-full gap-1.5">
          <RefreshCw size={14} /> Retry
        </Button>
      </div>
    </div>
  );
}
