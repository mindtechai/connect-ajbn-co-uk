import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { addDeal } from "@/lib/demoDeals";
import { PlusCircle } from "lucide-react";

const DEAL_TYPES = [
  "Capital Introduction",
  "Property Deal",
  "Business Referral",
  "Advisory Engagement",
  "Joint Venture",
  "Other",
];

export function LogActivityDialog({ onLogged }: { onLogged?: () => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [dealType, setDealType] = useState(DEAL_TYPES[0]);
  const [amount, setAmount] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [notes, setNotes] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const value = Number(amount);
    if (!isFinite(value) || value < 0) {
      toast.error("Enter a valid amount in GBP");
      return;
    }
    setBusy(true);
    addDeal({
      deal_type: dealType,
      amount_gbp: value,
      counterparty_name: counterparty || null,
      notes: notes || null,
    });
    toast.success("Activity Logged Successfully!", {
      description: `${dealType} · £${value.toLocaleString("en-GB")} added to the network ticker.`,
    });
    setAmount(""); setCounterparty(""); setNotes(""); setDealType(DEAL_TYPES[0]);
    setOpen(false);
    onLogged?.();
    setTimeout(() => setBusy(false), 800);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gold" size="sm" className="gap-1.5">
          <PlusCircle size={14} /> Log Activity
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log a closed network transaction</DialogTitle>
          <DialogDescription>
            Recording deals keeps the community ticker live. Only you and admins can view the details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dealType">Deal type</Label>
            <Select value={dealType} onValueChange={setDealType}>
              <SelectTrigger id="dealType"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DEAL_TYPES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (GBP)</Label>
            <Input id="amount" type="number" min={0} step="1" required value={amount}
              onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 50000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cp">Counterparty (optional)</Label>
            <Input id="cp" value={counterparty} onChange={(e) => setCounterparty(e.target.value)} placeholder="Name or company" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={busy} variant="gold">
              {busy ? "Saving…" : "Log activity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}