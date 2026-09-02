import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Link } from "@tanstack/react-router";
import { requestAccountDeletion } from "@/lib/account-deletion-request.functions";
import { CheckCircle2, Loader2, ShieldAlert, Trash2 } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AccountDeletionPage() {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ reference: string; dueBy: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const emailValid = EMAIL_RE.test(email.trim());
  const canSubmit = emailValid && acknowledged && !busy;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!emailValid) { setError("Please enter a valid email address."); return; }
    if (!acknowledged) { setError("Please confirm you understand this is permanent."); return; }
    setBusy(true);
    try {
      const res = await requestAccountDeletion({
        data: { email: email.trim(), reason: reason.trim(), acknowledged: true },
      });
      setDone({ reference: res.reference, dueBy: res.dueBy });
      toast({
        title: "Deletion request received",
        description: res.emailed
          ? "We've emailed you a confirmation."
          : "We've logged your request and will be in touch.",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
      toast({ title: "Request failed", description: message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppLayout back={{ to: "/", label: "Home" }} maxWidth="2xl">
      <header className="mb-6 border-b pb-6">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-primary mb-2">
          Request account deletion
        </h1>
        <p className="text-sm text-muted-foreground">
          Ask us to permanently delete your AJBN Connect account and all associated data.
          Requests are processed within 30 days.
        </p>
      </header>

      {done ? (
        <div className="bg-card border rounded-xl p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            <h2 className="font-display text-xl font-semibold">Request received</h2>
          </div>
          <p className="text-sm text-foreground/90">
            We have logged your deletion request and sent a confirmation email to{" "}
            <span className="font-medium">{email.trim()}</span>. Your account and data will be
            permanently deleted by <span className="font-medium">{done.dueBy}</span>.
          </p>
          <p className="text-sm text-muted-foreground">
            Reference: <span className="font-mono">{done.reference}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Changed your mind? Email{" "}
            <a className="underline underline-offset-2" href="mailto:russell@ajbn.co.uk">
              russell@ajbn.co.uk
            </a>{" "}
            and we will cancel it.
          </p>
        </div>
      ) : (
        <form onSubmit={submit} className="bg-card border rounded-xl p-6 shadow-xs space-y-5">
          <div className="space-y-2">
            <Label htmlFor="deletion-email">Email address</Label>
            <Input
              id="deletion-email"
              type="email"
              required
              maxLength={255}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
            />
            <p className="text-xs text-muted-foreground">
              Use the email address linked to your AJBN Connect account.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deletion-reason">Reason (optional)</Label>
            <Textarea
              id="deletion-reason"
              rows={4}
              maxLength={1000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Tell us why you're leaving — this helps us improve."
            />
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4">
            <Checkbox
              id="deletion-ack"
              checked={acknowledged}
              onCheckedChange={(v) => setAcknowledged(v === true)}
              className="mt-0.5"
            />
            <Label htmlFor="deletion-ack" className="text-sm font-normal leading-relaxed">
              I understand this will permanently delete my account and all associated data.
            </Label>
          </div>

          {error && (
            <p className="text-sm text-destructive flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" aria-hidden="true" /> {error}
            </p>
          )}

          <Button type="submit" variant="destructive" disabled={!canSubmit} className="gap-1.5">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            Submit deletion request
          </Button>
        </form>
      )}

      <section className="mt-8 space-y-2 text-sm text-muted-foreground">
        <h2 className="font-semibold text-foreground">What happens next</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>We email you a confirmation as soon as the request is received.</li>
          <li>
            Your profile, direct messages, event registrations and activity records are
            permanently erased within 30 days.
          </li>
          <li>
            Records we are legally required to keep (for example finance records) are retained
            only for as long as UK law requires.
          </li>
          <li>
            Signed in already? You can delete instantly from{" "}
            <Link to="/settings/profile" className="underline underline-offset-2">
              Account settings
            </Link>
            .
          </li>
          <li>
            See our{" "}
            <Link to="/privacy" className="underline underline-offset-2">
              Privacy Policy
            </Link>{" "}
            for full details on data retention and your rights.
          </li>
        </ul>
      </section>
    </AppLayout>
  );
}
