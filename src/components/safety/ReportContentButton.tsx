import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REPORT_REASONS, reportMember } from "@/lib/moderation";

type Props = {
  /** What is being reported, shown to the member and stored with the report. */
  subject: string;
  /** Member this content belongs to, when known. */
  targetId?: string | null;
  /** Prefix stored in the report details so the team knows the surface. */
  detailsPrefix?: string;
  label?: string;
};

/** Reusable report control for non-profile content (services, enquiries, listings). */
export function ReportContentButton({ subject, targetId, detailsPrefix, label = "Report" }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await reportMember({
        target_id: targetId ?? "",
        target_name: subject,
        reason,
        details: `${detailsPrefix ? `${detailsPrefix} ` : ""}${subject}. ${details.trim()}`.trim(),
        context: "profile",
      });
      setOpen(false);
      setDetails("");
      toast.success("Reported — our team will review this.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The report could not be sent.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground hover:text-destructive"
        onClick={() => setOpen(true)}
        aria-label={`Report: ${subject}`}
      >
        <Flag size={13} /> {label}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report this content</DialogTitle>
            <DialogDescription>
              “{subject}”. Reports go to the AJBN team only.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="content-report-details">Details (optional)</Label>
              <Textarea
                id="content-report-details"
                rows={3}
                value={details}
                maxLength={1000}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
            <Button onClick={() => void submit()} disabled={busy}>
              {busy && <Loader2 size={14} className="animate-spin" />} Send report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
