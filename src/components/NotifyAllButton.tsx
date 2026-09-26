import { useState } from "react";
import { Bell, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { notifyEventAll } from "@/lib/event-notify.functions";

interface Props {
  eventKey: string;
  title: string;
  body: string;
  className?: string;
}

export function NotifyAllButton({ eventKey, title, body, className }: Props) {
  const { isSuperAdmin } = useAuth();
  const send = useServerFn(notifyEventAll);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<string | null>(null);

  if (!isSuperAdmin) return null;

  const run = async (force: boolean) => {
    setBusy(true);
    try {
      const res = await send({ data: { eventKey, title, body, link: `/events#event-${eventKey}`, force } });
      if (res.alreadySent) {
        setConfirm(res.sentAt);
        return;
      }
      setConfirm(null);
      toast({ title: `Notified ${res.count} members` });
    } catch (e) {
      toast({ title: "Could not notify", description: (e as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button size="sm" variant="outline" className={className} disabled={busy} onClick={() => run(false)}>
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Bell size={14} />} Notify All
      </Button>
      <AlertDialog open={confirm !== null} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Already notified – send again?</AlertDialogTitle>
            <AlertDialogDescription>
              Members were notified about this event
              {confirm ? ` on ${new Date(confirm).toLocaleString("en-GB")}` : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => run(true)}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
