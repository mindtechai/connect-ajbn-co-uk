import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, ShieldCheck } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  recipientName?: string;
  recipientId?: string;
  onActivated?: () => void;
  activate: () => Promise<void>;
}

export function ActivateMessagingDialog({ open, onOpenChange, recipientName, recipientId, onActivated, activate }: Props) {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleActivate = async () => {
    setLoading(true);
    try {
      await activate();
      toast.success("Chat inbox activated");
      onActivated?.();
      if (recipientId) {
        const { data, error } = await (supabase as any).rpc("start_or_get_conversation", { _other: recipientId });
        if (error) throw error;
        navigate(`/messages/${data}`);
      }
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message ?? "Could not activate messaging");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto rounded-full bg-teal/10 w-12 h-12 grid place-items-center mb-2">
            <MessageCircle className="text-teal" size={24} />
          </div>
          <DialogTitle className="text-center">Enable Direct Messaging</DialogTitle>
          <DialogDescription className="text-center">
            Direct Messaging routes securely inside AJBN Connect — your phone number and email stay private.
            {recipientName ? <> Activate your chat inbox to start a conversation with <strong>{recipientName}</strong>.</> : " Activate your chat inbox to begin messaging fellow members."}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-start gap-2 rounded-md bg-muted p-3 text-xs text-muted-foreground">
          <ShieldCheck size={16} className="text-teal shrink-0 mt-0.5" />
          <p>
            Your phone number and email stay private.{" "}
            <Link to="/privacy" className="underline text-primary hover:text-primary/80">
              Read our Privacy Policy
            </Link>.
          </p>
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Not now</Button>
          <Button onClick={handleActivate} disabled={loading}>
            {loading ? "Activating…" : (recipientId ? "Activate & Open Chat" : "Activate My Chat Inbox")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}