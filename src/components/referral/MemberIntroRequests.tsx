import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import { Loader2, Send, Clock } from "lucide-react";

type IntroRequest = {
  id: string;
  target_name: string;
  target_company: string | null;
  target_email: string | null;
  reason: string;
  status: "pending" | "in_review" | "accepted" | "declined" | "completed" | "cancelled";
  admin_notes: string | null;
  created_at: string;
};

const schema = z.object({
  target_name: z.string().trim().min(2, "Name is required").max(120),
  target_company: z.string().trim().max(160).optional().or(z.literal("")),
  target_email: z.string().trim().email("Invalid email").max(255).optional().or(z.literal("")),
  reason: z.string().trim().min(10, "Add a short context (min 10 chars)").max(1000),
});

const statusStyles: Record<IntroRequest["status"], string> = {
  pending: "bg-muted text-foreground",
  in_review: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  accepted: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  completed: "bg-gold/20 text-gold",
  declined: "bg-destructive/15 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

const statusLabel: Record<IntroRequest["status"], string> = {
  pending: "Pending",
  in_review: "In review",
  accepted: "Accepted",
  completed: "Completed",
  declined: "Declined",
  cancelled: "Cancelled",
};

export function MemberIntroRequests() {
  const { user } = useAuth();
  const [items, setItems] = useState<IntroRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    target_name: "",
    target_company: "",
    target_email: "",
    reason: "",
  });

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("member_intro_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Couldn't load your requests", description: error.message, variant: "destructive" });
    } else {
      setItems((data ?? []) as IntroRequest[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      toast({ title: "Check the form", description: first ?? "Invalid input", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("member_intro_requests").insert({
      requester_id: user.id,
      target_name: parsed.data.target_name,
      target_company: parsed.data.target_company || null,
      target_email: parsed.data.target_email || null,
      reason: parsed.data.reason,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Couldn't submit", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Introduction requested", description: "We'll notify the target member and track status here." });
    setForm({ target_name: "", target_company: "", target_email: "", reason: "" });
    load();
  };

  const cancel = async (id: string) => {
    const { error } = await supabase
      .from("member_intro_requests")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (error) {
      toast({ title: "Couldn't cancel", description: error.message, variant: "destructive" });
      return;
    }
    load();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <form onSubmit={submit} className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-xl font-display font-semibold mb-1">Request a member-to-member intro</h3>
          <p className="text-sm text-muted-foreground">
            Free for members. Ask to be introduced directly to another member — no success fee applies.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="target_name">Member's name *</Label>
            <Input
              id="target_name"
              value={form.target_name}
              onChange={(e) => setForm({ ...form, target_name: e.target.value })}
              maxLength={120}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="target_company">Company</Label>
            <Input
              id="target_company"
              value={form.target_company}
              onChange={(e) => setForm({ ...form, target_company: e.target.value })}
              maxLength={160}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="target_email">Their email (optional)</Label>
          <Input
            id="target_email"
            type="email"
            value={form.target_email}
            onChange={(e) => setForm({ ...form, target_email: e.target.value })}
            maxLength={255}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reason">Why do you want the intro? *</Label>
          <Textarea
            id="reason"
            rows={4}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            maxLength={1000}
            required
          />
        </div>
        <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
          {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Submit request
        </Button>
      </form>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-display font-semibold">Your intro requests</h3>
          <Clock size={16} className="text-muted-foreground" />
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No requests yet. Submit your first intro on the left.
          </p>
        ) : (
          <ul className="space-y-3 max-h-[420px] overflow-auto pr-1">
            {items.map((r) => (
              <li key={r.id} className="rounded-lg border p-4 bg-background">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{r.target_name}</p>
                    {r.target_company && (
                      <p className="text-xs text-muted-foreground truncate">{r.target_company}</p>
                    )}
                  </div>
                  <Badge className={statusStyles[r.status]} variant="secondary">
                    {statusLabel[r.status]}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{r.reason}</p>
                {r.admin_notes && (
                  <p className="text-xs mt-2 rounded bg-muted p-2">
                    <span className="font-semibold">Note:</span> {r.admin_notes}
                  </p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                  {(r.status === "pending" || r.status === "in_review") && (
                    <Button size="sm" variant="ghost" onClick={() => cancel(r.id)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}