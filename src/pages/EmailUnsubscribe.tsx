import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type State =
  | { kind: "loading" }
  | { kind: "invalid" }
  | { kind: "already" }
  | { kind: "confirm" }
  | { kind: "submitting" }
  | { kind: "done" }
  | { kind: "error"; message: string };

export default function EmailUnsubscribePage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setState({ kind: "invalid" });
        return;
      }
      try {
        const res = await fetch(
          `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: SUPABASE_ANON } },
        );
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setState({ kind: "invalid" });
          return;
        }
        if (data.valid === false && data.reason === "already_unsubscribed") {
          setState({ kind: "already" });
          return;
        }
        setState({ kind: "confirm" });
      } catch (e) {
        if (!cancelled)
          setState({ kind: "error", message: (e as Error).message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const confirm = async () => {
    setState({ kind: "submitting" });
    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/handle-email-unsubscribe`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_ANON,
          },
          body: JSON.stringify({ token }),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState({ kind: "error", message: data.error || "Failed to unsubscribe" });
        return;
      }
      if (data.success === false && data.reason === "already_unsubscribed") {
        setState({ kind: "already" });
        return;
      }
      setState({ kind: "done" });
    } catch (e) {
      setState({ kind: "error", message: (e as Error).message });
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card border rounded-lg p-8 shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Email preferences</h1>
        {state.kind === "loading" && (
          <p className="text-muted-foreground">Checking your unsubscribe link…</p>
        )}
        {state.kind === "invalid" && (
          <p className="text-muted-foreground">
            This unsubscribe link is invalid or has expired.
          </p>
        )}
        {state.kind === "already" && (
          <p className="text-muted-foreground">
            You've already unsubscribed. No further action is needed.
          </p>
        )}
        {state.kind === "confirm" && (
          <>
            <p className="text-muted-foreground mb-6">
              Click below to confirm you want to unsubscribe from AJBN Connect
              emails.
            </p>
            <Button onClick={confirm}>Confirm unsubscribe</Button>
          </>
        )}
        {state.kind === "submitting" && (
          <p className="text-muted-foreground">Processing…</p>
        )}
        {state.kind === "done" && (
          <p className="text-muted-foreground">
            You've been unsubscribed. We're sorry to see you go.
          </p>
        )}
        {state.kind === "error" && (
          <p className="text-destructive">Error: {state.message}</p>
        )}
      </div>
    </main>
  );
}