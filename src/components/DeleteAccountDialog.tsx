import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const canDelete = confirm.trim() === "DELETE";

  const onDelete = async () => {
    if (!canDelete) return;
    setBusy(true);
    try {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      await supabase.auth.signOut();
      toast({ title: "Account successfully deleted." });
      navigate("/", { replace: true });
    } catch (e: any) {
      toast({ title: "Deletion failed", description: e?.message ?? "Please try again.", variant: "destructive" });
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!busy) { setOpen(o); if (!o) setConfirm(""); } }}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-1.5">
          <Trash2 size={14} /> Delete Account
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your AJBN Connect account?</DialogTitle>
          <DialogDescription>
            Are you absolutely sure you want to permanently delete your AJBN Connect account?
            This action cannot be undone, and all profile data, direct messages, and logged deals
            will be permanently wiped.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 pt-2">
          <Label htmlFor="confirm-delete">Type <span className="font-mono font-semibold">DELETE</span> to confirm</Label>
          <Input
            id="confirm-delete"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="DELETE"
            autoComplete="off"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
          <Button variant="destructive" onClick={onDelete} disabled={!canDelete || busy} className="gap-1.5">
            {busy && <Loader2 size={14} className="animate-spin" />}
            Permanently delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}