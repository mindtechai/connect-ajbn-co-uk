import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OfflineFallback() {
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  if (online) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-primary/95 backdrop-blur-sm grid place-items-center p-6">
      <div className="max-w-sm w-full bg-card border rounded-2xl p-8 text-center shadow-2xl">
        <div className="mx-auto w-14 h-14 rounded-full bg-muted grid place-items-center mb-4">
          <WifiOff className="text-muted-foreground" />
        </div>
        <h2 className="font-display text-xl font-bold mb-2">You're offline</h2>
        <p className="text-sm text-muted-foreground mb-6">
          AJBN Connect needs an internet connection. Check your Wi-Fi or mobile data and try again.
        </p>
        <Button onClick={() => window.location.reload()} className="w-full gap-1.5">
          <RefreshCw size={14} /> Retry
        </Button>
      </div>
    </div>
  );
}