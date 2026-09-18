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
import { useAuth } from "@/hooks/useAuth";
import { aiMatcherEnabledFor } from "@/lib/ai-matcher-flag";
import { REPORT_REASONS, reportMember } from "@/lib/moderation";
import type { BoardPost } from "@/lib/board-posts";

/**
 * Report flag for a Needs & Offers post (App Store UGC requirement).
 * Hidden for the store-review account, matching the AI matcher rule.
 */
export function BoardPostReportButton({
  post,
  authorName,
}: {
  post: BoardPost;
  authorName: string;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  if (!aiMatcherEnabledFor(user?.email ?? null)) return null;
  if (post.author_id === user?.id) return null;

  const submit = async () => {
    setBusy(true);
    try {
      await reportMember({
        target_id: post.author_id,
        target_name: authorName,
        reason,
        details: `${post.kind === "need" ? "NEED" : "OFFER"} post "${post.title}" (${post.category}). ${details.trim()}`.trim(),
        context: "profile",
      });
      setOpen(false);
      setDetails("");
      toast.success("Thank you — our team will review this post.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The report could not be sent.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Report post: ${post.title}`}
        title="Report this post"
        className="text-muted-foreground hover:text-destructive transition-colors"
      >
        <Flag size={13} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report this post</DialogTitle>
            <DialogDescription>
              “{post.title}” by {authorName}. Reports go to the AJBN team only.
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
              <Label htmlFor="board-report-details">Details (optional)</Label>
              <Textarea
                id="board-report-details"
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
