import { useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, ArrowRight, ShieldCheck, X, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMessagingProfile } from "@/hooks/useMessagingProfile";

const DISMISS_KEY = "ajbn.messaging.onboarding.dismissed";

export function MessagingOnboardingCard() {
  const { isActive, loading, activate } = useMessagingProfile();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(DISMISS_KEY) === "1";
  });
  const [busy, setBusy] = useState(false);

  if (loading) return null;
  if (isActive && dismissed) return null;

  const handleActivate = async () => {
    setBusy(true);
    try {
      await activate();
      toast.success("Chat inbox activated — you're ready to message members.");
    } catch (e: any) {
      toast.error(e.message ?? "Could not activate messaging");
    } finally {
      setBusy(false);
    }
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="relative mb-6 overflow-hidden rounded-xl border bg-navy-gradient text-white shadow-sm">
      <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden>
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-teal blur-3xl" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-gold blur-3xl" />
      </div>
      {isActive && (
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-white/70 hover:text-white"
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      )}
      <div className="relative p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div className="shrink-0 rounded-xl bg-white/10 border border-white/15 w-12 h-12 grid place-items-center">
          {isActive
            ? <CheckCircle2 size={22} className="text-gold" />
            : <MessageCircle size={22} className="text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-display text-lg md:text-xl font-semibold">
              {isActive ? "Your chat inbox is active" : "Connect Instantly"}
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-gold/20 text-gold border border-gold/30 rounded-full px-2 py-0.5">
              New
            </span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed">
            {isActive
              ? "Head to your inbox to talk with fellow AJBN members. Your phone and email always stay private."
              : "Direct Member Messaging is now live. Tap into the network to discuss capital, property, and business collaborations securely inside the app."}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-white/70">
            <ShieldCheck size={12} className="text-teal" />
            <span>Contact details stay private — messages route inside AJBN Connect only.</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          {isActive ? (
            <Link to="/messages">
              <Button variant="gold" className="w-full sm:w-auto gap-1.5">
                Open Inbox <ArrowRight size={14} />
              </Button>
            </Link>
          ) : (
            <Button
              onClick={handleActivate}
              disabled={busy}
              variant="gold"
              className="w-full sm:w-auto gap-1.5"
            >
              {busy ? "Activating…" : (<>Activate My Chat Inbox <ArrowRight size={14} /></>)}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}