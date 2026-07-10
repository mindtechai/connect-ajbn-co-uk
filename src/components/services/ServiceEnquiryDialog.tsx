import { useEffect, useState } from "react";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("first_name,last_name,email")
        .eq("id", user.id)
        .maybeSingle();
      const full = [data?.first_name, data?.last_name].filter(Boolean).join(" ").trim();
      setName((prev) => prev || full || (user.user_metadata?.first_name ?? ""));
      setEmail((prev) => prev || data?.email || user.email || "");
    })();
  }, [open, user]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ name, email, phone, message });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("service_enquiries").insert({
      user_id: user?.id ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message || null,
      service_type: serviceType,
    });
    if (error) {
      setSubmitting(false);
      toast.error("Could not submit. Please try again.");
      return;
    }
    // Lightweight routing logic (email dispatch handled downstream)
    const routeTo =
      serviceType === "Referral Incentives Marketplace"
        ? "Russell@ajbn.co.uk"
        : "Salil@ajbn.co.uk";
    console.info("[service-enquiry] route", { serviceType, routeTo });
    toast.success("Thank you — our team will be in touch within 24 hours");
    setPhone("");
    setMessage("");
    onOpenChange(false);
    // 3s cooldown to prevent double submissions
    setTimeout(() => setSubmitting(false), 3000);
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