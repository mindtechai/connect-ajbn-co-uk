import { useEffect, useMemo, useState } from "react";
import { Send, Mail } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type TemplateOption = { value: string; label: string; kind: "auth" | "transactional" };

const AUTH_OPTIONS: TemplateOption[] = [
  { value: "signup", label: "Signup confirmation", kind: "auth" },
  { value: "magiclink", label: "Magic link", kind: "auth" },
  { value: "recovery", label: "Password recovery", kind: "auth" },
  { value: "invite", label: "Invite", kind: "auth" },
  { value: "email_change", label: "Email change", kind: "auth" },
  { value: "reauthentication", label: "Reauthentication OTP", kind: "auth" },
];

const TRANSACTIONAL_OPTIONS: TemplateOption[] = [
  { value: "bulk-message", label: "Bulk message / announcement", kind: "transactional" },
];

const emailSchema = z.string().trim().email().max(254);

export function SendTestEmailCard() {
  const { user } = useAuth();
  const allOptions = useMemo(() => [...AUTH_OPTIONS, ...TRANSACTIONAL_OPTIONS], []);
  const [selected, setSelected] = useState<string>(AUTH_OPTIONS[0].value);
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (user?.email && !recipient) setRecipient(user.email);
  }, [user, recipient]);

  const handleSend = async () => {
    const parsed = emailSchema.safeParse(recipient);
    if (!parsed.success) {
      toast({ title: "Invalid email", description: "Enter a valid recipient address.", variant: "destructive" });
      return;
    }
    const option = allOptions.find((o) => o.value === selected);
    if (!option) return;
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-test-email", {
        body: {
          kind: option.kind,
          templateName: option.value,
          recipientEmail: parsed.data,
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      toast({
        title: "Test email queued",
        description: `Sent “${option.label}” to ${parsed.data}. Message id: ${(data as any)?.messageId ?? "n/a"}`,
      });
    } catch (e: any) {
      toast({
        title: "Failed to send",
        description: e?.message ?? "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Mail size={16} className="text-primary" />
        <h2 className="font-semibold text-sm">Send test email</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Send a real copy of any auth or transactional template through the live email pipeline. Uses placeholder preview data.
      </p>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label className="text-xs">Template</Label>
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Auth</SelectLabel>
                {AUTH_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Transactional</SelectLabel>
                {TRANSACTIONAL_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Recipient</Label>
          <Input
            type="email"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <Button onClick={handleSend} disabled={sending} className="gap-1.5">
          <Send size={14} /> {sending ? "Sending…" : "Send test"}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Rate-limited to 20 sends per hour. Every send is written to the admin audit log.
      </p>
    </div>
  );
}