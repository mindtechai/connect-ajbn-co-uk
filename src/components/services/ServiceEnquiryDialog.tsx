import { useEffect, useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  serviceType: string;
}

export function ServiceEnquiryDialog({ open, onOpenChange, serviceType }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Pre-populate from the demo profile store if available
  useEffect(() => {
    if (!open) return;
    try {
      const raw = localStorage.getItem("ajbn_demo_profile");
      if (raw) {
        const profile = JSON.parse(raw) as {
          first_name?: string;
          last_name?: string;
          email?: string;
        };
        const full = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim();
        setName((prev) => prev || full || "");
        setEmail((prev) => prev || profile.email || "");
      }
    } catch {
      // ignore malformed localStorage
    }
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email, phone, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    toast.success("Inquiry Submitted Successfully!", {
      description: "An AJBN representative will contact you shortly.",
    });
    setPhone("");
    setMessage("");
    onOpenChange(false);
    setTimeout(() => setSubmitting(false), 300);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{serviceType}</DialogTitle>
          <DialogDescription>
            Share a few details and our team will be in touch within 24 hours.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="svc-name">Name</Label>
            <Input id="svc-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="svc-email">Email</Label>
            <Input id="svc-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="svc-phone">Phone number</Label>
            <Input id="svc-phone" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} placeholder="Optional" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="svc-message">Message</Label>
            <Textarea id="svc-message" value={message} onChange={(e) => setMessage(e.target.value)} required minLength={10} maxLength={2000} rows={4} placeholder="Tell us a bit about what you need (min 10 characters)" />
          </div>
          <Button type="submit" className="w-full" disabled={submitting} data-testid="svc-submit">
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send enquiry
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
