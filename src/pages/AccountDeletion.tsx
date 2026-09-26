import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "@tanstack/react-router";
import { PublicHeader } from "@/components/PublicHeader";
import { requestAccountDeletion } from "@/lib/account-deletion-request.functions";
import { isValidEmailAddress } from "@/lib/email-validation";
import { CheckCircle2, Loader2, Mail, Shield, Trash2 } from "lucide-react";
const AJBN_BLUE = "#164164";

/** Store-review accounts cannot be removed while an app review is in progress. */
const PROTECTED_EMAILS = ["apple-review@ajbn.co.uk", "support@ajbn.co.uk"];

const ACCOUNT_TYPES = [
  "Approved AJBN Member",
  "Registered but not approved",
  "Not sure",
];
const REASONS = [
  "No longer a member",
  "Privacy concern",
  "Duplicate account",
  "Other",
];

const DATA_TYPES =
  "Name, Email, Phone Number, Physical Address (business address), Profile Photos, Emails/Text Messages (121 messages), Other User Content, User ID";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

type Errors = Partial<
  Record<"fullName" | "email" | "accountType" | "reason" | "acknowledged" | "form", string>
>;

export default function AccountDeletionPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [accountType, setAccountType] = useState("");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;

    const next: Errors = {};
    if (!fullName.trim()) next.fullName = "Please enter your full name.";
    if (!isValidEmailAddress(email)) next.email = "Please enter a valid email address.";
    else if (PROTECTED_EMAILS.includes(email.trim().toLowerCase()))
      next.email = "Review account cannot be deleted";
    if (!accountType) next.accountType = "Please select your account type.";
    if (!reason) next.reason = "Please select a reason.";
    if (!acknowledged) next.acknowledged = "Please confirm you want to delete your account.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      await requestAccountDeletion({
        data: {
          fullName: fullName.trim(),
          email: email.trim(),
          accountType,
          reason,
          details: details.trim(),
          acknowledged: true,
        },
      });
      setDone(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setErrors({ form: message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <PublicHeader />

      <main className="mx-auto max-w-[800px] px-4 py-8 md:py-12">
        <h1
          className="font-display text-3xl font-bold md:text-4xl"
          style={{ color: AJBN_BLUE }}
        >
          Delete Your AJBN Connect Account
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-700">
          AJBN Connect is a closed network. Only approved AJBN members can access Directory,
          1-2-1 Messaging, Referral Rewards. Non-members can register but have limited access
          until approved. Charitable activities via AJBN Impact Lions Club District 105A are
          restricted to existing AJBN members only. You can delete your account anytime —
          approved member or non-approved registrant.
        </p>

        {done ? (
          <div
            role="status"
            className="mt-8 rounded-xl border border-green-200 bg-green-50 p-6"
          >
            <div className="flex items-center gap-2" style={{ color: AJBN_BLUE }}>
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              <h2 className="font-display text-xl font-semibold">Request received</h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              Request received. We will verify within 24 hours and delete within 30 days.
              Confirmation will be sent to your email. Backups purged within 90 days.
            </p>
          </div>
        ) : (
          <form
            onSubmit={submit}
            noValidate
            className="mt-8 space-y-5 rounded-xl border bg-white p-6 shadow-sm"
          >
            <div className="space-y-2">
              <Label htmlFor="del-name">Full Name</Label>
              <Input
                id="del-name"
                value={fullName}
                maxLength={160}
                autoComplete="name"
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? "del-name-err" : undefined}
                onChange={(e) => setFullName(e.target.value)}
              />
              {errors.fullName && (
                <p id="del-name-err" className="text-sm text-red-600">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="del-email">Registered Email</Label>
              <Input
                id="del-email"
                type="email"
                value={email}
                maxLength={255}
                autoComplete="email"
                placeholder="you@company.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "del-email-err" : "del-email-hint"}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p id="del-email-hint" className="text-xs text-slate-500">
                Must match the email on your AJBN Connect account.
              </p>
              {errors.email && (
                <p id="del-email-err" className="text-sm text-red-600">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="del-type">Account Type</Label>
              <select
                id="del-type"
                className={selectClass}
                value={accountType}
                aria-invalid={!!errors.accountType}
                onChange={(e) => setAccountType(e.target.value)}
              >
                <option value="">Select an option</option>
                {ACCOUNT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.accountType && (
                <p className="text-sm text-red-600">{errors.accountType}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="del-reason">Reason for deletion</Label>
              <select
                id="del-reason"
                className={selectClass}
                value={reason}
                aria-invalid={!!errors.reason}
                onChange={(e) => setReason(e.target.value)}
              >
                <option value="">Select a reason</option>
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {errors.reason && <p className="text-sm text-red-600">{errors.reason}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="del-details">Other details (optional)</Label>
              <Textarea
                id="del-details"
                rows={4}
                maxLength={2000}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <Checkbox
                id="del-ack"
                checked={acknowledged}
                onCheckedChange={(v) => setAcknowledged(v === true)}
                className="mt-0.5"
              />
              <Label
                htmlFor="del-ack"
                className="text-sm font-normal leading-relaxed text-slate-700"
              >
                I confirm I want to permanently delete my account and all associated data:{" "}
                {DATA_TYPES}. I understand this cannot be undone.
              </Label>
            </div>
            {errors.acknowledged && (
              <p className="text-sm text-red-600">{errors.acknowledged}</p>
            )}

            {errors.form && (
              <p className="flex items-center gap-1.5 text-sm text-red-600">
                <Shield className="h-4 w-4" aria-hidden="true" /> {errors.form}
              </p>
            )}

            <Button
              type="submit"
              disabled={busy}
              className="gap-1.5 text-white hover:opacity-90"
              style={{ backgroundColor: AJBN_BLUE }}
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Request Account Deletion
            </Button>
          </form>
        )}

        <section className="mt-10">
          <h2 className="font-display text-xl font-semibold" style={{ color: AJBN_BLUE }}>
            What happens after
          </h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>Verification within 24 hours</li>
            <li>
              Deletion within 30 days: Name, Email Address, Phone Number, Physical Address,
              Emails or Text Messages, Photos or Videos, Other User Content, User ID (the 8
              types declared in App Store Connect)
            </li>
            <li>Directory listing, referral rewards, 121 messages removed</li>
            <li>Backup deletion within 90 days</li>
            <li>Minimal legal record (email + deletion date) retained 12 months for audit</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="font-display text-xl font-semibold" style={{ color: AJBN_BLUE }}>
            Alternative
          </h2>
          <p className="mt-3 text-sm text-slate-700">
            Email directly: admin@ajbn.co.uk with subject &quot;Delete my AJBN Connect account
            - [your email]&quot;
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              asChild
              variant="outline"
              className="gap-1.5"
              style={{ borderColor: AJBN_BLUE, color: AJBN_BLUE }}
            >
              <a href="mailto:admin@ajbn.co.uk?subject=Delete my AJBN Connect account">
                <Mail className="h-4 w-4" aria-hidden="true" />
                Email Deletion Request
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="gap-1.5"
              style={{ borderColor: AJBN_BLUE, color: AJBN_BLUE }}
            >
              <Link to="/privacy">Privacy Policy</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="mt-12 border-t py-6">
        <p className="mx-auto max-w-[800px] px-4 text-xs text-slate-500">
          AJBNetwork Limited 2026
        </p>
      </footer>
    </div>
  );
}
