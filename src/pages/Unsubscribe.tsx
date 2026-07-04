import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, Mail, Undo2 } from "lucide-react";
import { BrandLink } from "@/components/BrandLink";

const CATEGORY_LABELS: Record<string, string> = {
  announcements: "Announcements",
  events: "Events & RSVPs",
  renewals: "Membership & renewals",
  lions: "Impact Lions",
  general: "General messages",
};

export default function UnsubscribePage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const category = params.get("category") ?? undefined;
  const [state, setState] = useState<"validating" | "confirm" | "done" | "invalid" | "error">("validating");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!token) { setState("invalid"); return; }
      try {
        const url = `${(import.meta as any).env.VITE_SUPABASE_URL}/functions/v1/handle-unsubscribe?token=${encodeURIComponent(token)}`;
        const res = await fetch(url, { headers: { apikey: (import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "" } });
        const json = await res.json();
        if (json.valid) setState("confirm"); else setState("invalid");
      } catch (e: any) {
        setError(e?.message ?? String(e));
        setState("error");
      }
    })();
  }, [token]);

  const submit = async (resubscribe: boolean) => {
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.functions.invoke("handle-unsubscribe", {
      body: { token, category, channel: "email", resubscribe },
    });
    setBusy(false);
    if (error || (data as any)?.error) {
      setError((error?.message ?? (data as any)?.error) || "Something went wrong.");
      setState("error");
    } else {
      setState("done");
    }
  };

  const catLabel = category ? (CATEGORY_LABELS[category] ?? category) : "all email";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 lg:px-8 h-14 flex items-center">
          <BrandLink />
        </div>
      </header>
      <div className="grid place-items-center px-4 py-12">
      <div className="max-w-md w-full bg-card border rounded-2xl shadow-sm p-8 text-center space-y-4">
        {state === "validating" && (
          <>
            <Loader2 className="mx-auto animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Checking your link…</p>
          </>
        )}

        {state === "invalid" && (
          <>
            <XCircle className="mx-auto text-destructive" size={40} />
            <h1 className="text-xl font-display font-semibold">Invalid or expired link</h1>
            <p className="text-sm text-muted-foreground">
              This unsubscribe link is no longer valid. Manage your preferences from your dashboard instead.
            </p>
            <Link to="/dashboard"><Button variant="outline" size="sm">Go to dashboard</Button></Link>
          </>
        )}

        {state === "confirm" && (
          <>
            <Mail className="mx-auto text-primary" size={40} />
            <h1 className="text-xl font-display font-semibold">Unsubscribe from {catLabel}?</h1>
            <p className="text-sm text-muted-foreground">
              You will stop receiving <span className="font-medium text-foreground">{catLabel}</span> emails from AJBN. You can re-enable this any time from your notification preferences.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <Button onClick={() => submit(false)} disabled={busy} className="gap-1.5">
                {busy && <Loader2 className="animate-spin" size={14} />} Confirm unsubscribe
              </Button>
              <Button variant="outline" onClick={() => submit(true)} disabled={busy} className="gap-1.5">
                <Undo2 size={14} /> Keep subscribed
              </Button>
            </div>
          </>
        )}

        {state === "done" && (
          <>
            <CheckCircle2 className="mx-auto text-teal" size={40} />
            <h1 className="text-xl font-display font-semibold">Preferences updated</h1>
            <p className="text-sm text-muted-foreground">
              Thanks — your choice has been saved. You can fine-tune categories in your dashboard at any time.
            </p>
            <Link to="/dashboard"><Button variant="outline" size="sm">Go to dashboard</Button></Link>
          </>
        )}

        {state === "error" && (
          <>
            <XCircle className="mx-auto text-destructive" size={40} />
            <h1 className="text-xl font-display font-semibold">Something went wrong</h1>
            <p className="text-sm text-muted-foreground">{error ?? "Please try again in a moment."}</p>
          </>
        )}
      </div>
    </div>
    </div>
  );
}