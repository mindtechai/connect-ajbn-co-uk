import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "@/lib/router-compat";
import { useAuth } from "@/hooks/useAuth";
import { Play, Apple, X, Smartphone } from "lucide-react";

const STORAGE_KEY = "downloadRibbonDismissed";
const DISMISS_TTL_MS = 24 * 60 * 60 * 1000;
const AJBN_BLUE = "#0E3A7B";

const TABBAR_HIDE_ON = [
  /^\/login/,
  /^\/register/,
  /^\/reset-password/,
  /^\/forgot-password/,
  /^\/admin/,
];

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function DownloadRibbon() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [visible, setVisible] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  const tabBarVisible = Boolean(
    user && !TABBAR_HIDE_ON.some((r) => r.test(pathname))
  );

  useEffect(() => {
    // Only run in the browser.
    if (typeof window === "undefined") return;

    // Hide on the install page itself and in installed PWA mode.
    if (pathname === "/install") return;
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    if (standalone) return;

    // Respect a recent dismiss.
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const dismissedAt = parseInt(raw, 10);
        if (Date.now() - dismissedAt < DISMISS_TTL_MS) return;
      }
    } catch {
      // Ignore storage errors (e.g. private mode).
    }

    setVisible(true);

    const handler = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [pathname]);

  if (!visible) return null;

  const handleInstall = async () => {
    const prompt = deferredPrompt.current;
    if (prompt) {
      try {
        await prompt.prompt();
        // The user either accepted or dismissed the native prompt.
        deferredPrompt.current = null;
      } catch {
        // Fall through to the install page if the prompt fails.
        navigate("/install");
      }
    } else {
      navigate("/install");
    }
  };

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch {
      // Ignore storage errors.
    }
    setVisible(false);
  };

  return (
    <div
      className={`fixed inset-x-0 z-50 shadow-lg px-3 py-3 md:px-4 md:py-3 ${
        tabBarVisible
          ? "ajbn-ribbon-bottom-with-tabbar"
          : "ajbn-ribbon-bottom"
      }`}
      style={{
        backgroundColor: AJBN_BLUE,
        color: "#ffffff",
      }}
    >
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-3 relative">
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss download banner"
          className="absolute top-0 right-0 md:relative md:order-3 md:top-auto md:right-auto p-1.5 rounded-md hover:bg-white/10 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white/70"
        >
          <X size={18} aria-hidden="true" />
        </button>

        <span className="text-sm font-semibold text-center md:text-left pr-8 md:pr-0 flex items-center gap-2">
          <Smartphone size={16} aria-hidden="true" />
          Download AJBN Connect App
        </span>

        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            type="button"
            onClick={handleInstall}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-xs font-semibold whitespace-nowrap transition-transform active:scale-95 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white/70"
            style={{
              backgroundColor: AJBN_BLUE,
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.35)",
            }}
          >
            <Play size={16} fill="currentColor" aria-hidden="true" />
            Get it on Google Play
          </button>
          <button
            type="button"
            onClick={handleInstall}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-xs font-semibold whitespace-nowrap transition-transform active:scale-95 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-white/70"
            style={{
              backgroundColor: AJBN_BLUE,
              color: "#ffffff",
              border: "1px solid rgba(255,255,255,0.35)",
            }}
          >
            <Apple size={16} aria-hidden="true" />
            Download on App Store
          </button>
        </div>
      </div>
    </div>
  );
}
