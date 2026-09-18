import { useEffect, useState } from "react";
import { Ban, Flag, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
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
import { notifyMemberReport } from "@/lib/member-report.functions";
import {
  REPORT_REASONS,
  blockMember,
  isBlocked,
  reportMember,
  syncBlocked,
  unblockMember,
} from "@/lib/moderation";

type Props = {
  memberId: string;
  memberName: string;
  context: "chat" | "profile";
  compact?: boolean;
};

/**
 * Large, always-visible Block user / Report user buttons. Same data layer as
 * MemberSafetyMenu, presented as primary actions (used in reviewer mode).
 */
export function MemberSafetyActions({ memberId, memberName, context, compact = false }: Props) {
  const [blocked, setBlocked] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const notify = useServerFn(notifyMemberReport);

  useEffect(() => {
    const sync = () => setBlocked(isBlocked(memberId));
    sync();
    void syncBlocked();
    window.addEventListener("ajbn-moderation-changed", sync);
    return () => window.removeEventListener("ajbn-moderation-changed", sync);
  }, [memberId]);

  const doBlock = async () => {
    setBusy(true);
    try {
      await blockMember(memberId);
      setConfirmBlock(false);
      toast.success(`${memberName} blocked`, {
        description: "Blocked — the team will review this member.",
      });
    } catch (e) {
      toast.error("Couldn't block this member", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const doUnblock = async () => {
    try {
      await unblockMember(memberId);
      toast.success(`${memberName} unblocked`);
    } catch (e) {
      toast.error("Couldn't unblock this member", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    }
  };

  const submitReport = async () => {
    setBusy(true);
    try {
      const created = await reportMember({
        target_id: memberId,
        target_name: memberName,
        reason,
        details: details.trim(),
        context,
      });
      setReportOpen(false);
      setDetails("");
      const notification = await notify({ data: { reportId: created.id } });
      if (!notification.ok) {
        toast.warning("Report saved", {
          description: "Your report is in the admin review queue, but the email alert could not be sent.",
        });
        return;
      }
      toast.success("Reported — the team will review", {
        description: "Reports are reviewed within 24 hours.",
      });
    } catch (e) {
      toast.error("Couldn't submit your report", {
        description: e instanceof Error ? e.message : "Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const size = compact ? "sm" : "lg";

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {blocked ? (
          <Button type="button" size={size} variant="outline" onClick={() => { void doUnblock(); }}>
            <ShieldOff size={16} /> Unblock user
          </Button>
        ) : (
          <Button type="button" size={size} variant="outline" onClick={() => setConfirmBlock(true)}>
            <Ban size={16} /> Block user
          </Button>
        )}
        <Button type="button" size={size} variant="destructive" onClick={() => setReportOpen(true)}>
          <Flag size={16} /> Report user
        </Button>
      </div>

      <AlertDialog open={confirmBlock} onOpenChange={setConfirmBlock}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {memberName}?</AlertDialogTitle>
            <AlertDialogDescription>
              They won't be able to message you, and their profile and posts are hidden from you.
              You can unblock them at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); void doBlock(); }} disabled={busy}>Block</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report {memberName}</DialogTitle>
            <DialogDescription>
              Reports go to the AJBN team and are reviewed within 24 hours. Objectionable content
              and abusive members are removed from the network.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REPORT_REASONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>What happened? (optional)</Label>
              <Textarea
                rows={4}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Add any detail that helps us review this quickly…"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { void submitReport(); }} disabled={busy}>
              {busy ? "Submitting…" : "Submit report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
