import { useState } from "react";
import { Ban, Flag, Loader2, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { REPORT_REASONS, blockMember, reportMember } from "@/lib/moderation";
import type { BoardPost } from "@/lib/board-posts";

/**
 * Safety menu on every Needs & Offers post: report the post, or block the
 * member who posted it (App Store guideline 1.2 requirement).
 */
export function BoardPostSafetyMenu({
  post,
  authorName,
}: {
  post: BoardPost;
  authorName: string;
}) {
  const { user } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user || post.author_id === user.id) return null;

  const submitReport = async () => {
    setBusy(true);
    try {
      await reportMember({
        target_id: post.author_id,
        target_name: authorName,
        reason,
        details: `${post.kind === "need" ? "NEED" : "OFFER"} post "${post.title}" (${post.category}). ${details.trim()}`.trim(),
        context: "profile",
      });
      setReportOpen(false);
      setDetails("");
      toast.success("Reported — our team will review this.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The report could not be sent.");
    } finally {
      setBusy(false);
    }
  };

  const doBlock = async () => {
    setBusy(true);
    try {
      await blockMember(post.author_id);
      setConfirmBlock(false);
      toast.success(`Blocked ${authorName} — our team will review this.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The member could not be blocked.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`Safety options for post: ${post.title}`}
            title="Report or block"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <MoreVertical size={15} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onSelect={() => setReportOpen(true)}>
            <Flag size={14} /> Report post
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => setConfirmBlock(true)}
            className="text-destructive focus:text-destructive"
          >
            <Ban size={14} /> Block user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
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
            <Button variant="outline" onClick={() => setReportOpen(false)} disabled={busy}>Cancel</Button>
            <Button onClick={() => void submitReport()} disabled={busy}>
              {busy && <Loader2 size={14} className="animate-spin" />} Send report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmBlock} onOpenChange={setConfirmBlock}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {authorName}?</AlertDialogTitle>
            <AlertDialogDescription>
              You will not see their posts or messages, and they cannot contact you.
              You can undo this from their profile at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); void doBlock(); }} disabled={busy}>
              Block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
