import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Megaphone, Send, Mail, Bell, Users, Crown, UserPlus, Clock,
  AlertTriangle, Info, Sparkles, Trash2, MessageSquare, Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type SegmentKey = "ajbn" | "lions" | "prospective" | "expired" | "board";

const SEGMENTS: { key: SegmentKey; label: string; count: number; icon: any; tint: string }[] = [
  { key: "ajbn", label: "AJBN Members", count: 114, icon: Users, tint: "bg-teal/10 text-teal border-teal/30" },
  { key: "lions", label: "Impact Lions", count: 48, icon: Crown, tint: "bg-gold/10 text-gold border-gold/40" },
  { key: "prospective", label: "Prospective", count: 27, icon: UserPlus, tint: "bg-primary/10 text-primary border-primary/30" },
  { key: "expired", label: "Expired", count: 22, icon: Clock, tint: "bg-muted text-muted-foreground border-border" },
  { key: "board", label: "Board & Committee", count: 9, icon: Sparkles, tint: "bg-destructive/10 text-destructive border-destructive/30" },
];

const PRIORITIES = [
  { value: "info", label: "Informational", icon: Info, color: "text-teal" },
  { value: "important", label: "Important", icon: Bell, color: "text-primary" },
  { value: "urgent", label: "Urgent", icon: AlertTriangle, color: "text-destructive" },
];

const QUICK_TEMPLATES = [
  { label: "Event Reminder", subject: "Reminder: {event} on {date}", body: "Hi {first_name},\n\nA quick reminder that {event} takes place on {date}. We look forward to seeing you there.\n\n– AJBN Team" },
  { label: "Renewal Notice", subject: "Your AJBN membership renewal", body: "Hi {first_name},\n\nYour membership is due for renewal. Renew in one click from your dashboard to keep your benefits active.\n\n– AJBN Team" },
  { label: "Lions Fundraise", subject: "Impact Lions – new campaign", body: "Dear Lion,\n\nOur latest charitable campaign is now live. Every contribution counts.\n\n– Impact Lions Club" },
];

const recentActions = [
  { id: "a1", type: "announcement", title: "Annual Flagship Dinner – save the date", segments: ["AJBN", "Lions"], recipients: 162, at: "2 days ago", priority: "important" },
  { id: "a2", type: "email", title: "Impact Lions Golf Day RSVP", segments: ["Lions"], recipients: 48, at: "5 days ago", priority: "info" },
  { id: "a3", type: "announcement", title: "Portal maintenance window", segments: ["All"], recipients: 220, at: "1 week ago", priority: "urgent" },
];

export function BulkActionsPanel() {
  const [tab, setTab] = useState<"announcement" | "email">("announcement");
  const [selected, setSelected] = useState<SegmentKey[]>(["ajbn"]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("info");
  const [category, setCategory] = useState<"announcements" | "events" | "renewals" | "lions" | "general">("general");
  const [channelEmail, setChannelEmail] = useState(true);
  const [channelInApp, setChannelInApp] = useState(true);
  const [pinToDashboard, setPinToDashboard] = useState(false);
  const [schedule, setSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<null | {
    bulkId: string;
    deliveries: any[];
    note?: string | null;
  }>(null);
  const { toast } = useToast();

  const toggleSegment = (k: SegmentKey) =>
    setSelected((prev) => prev.includes(k) ? prev.filter((s) => s !== k) : [...prev, k]);

  const selectAll = () => setSelected(SEGMENTS.map((s) => s.key));
  const clearAll = () => setSelected([]);

  const recipientCount = SEGMENTS
    .filter((s) => selected.includes(s.key))
    .reduce((sum, s) => sum + s.count, 0);

  const applyTemplate = (t: (typeof QUICK_TEMPLATES)[number]) => {
    setTitle(t.subject);
    setBody(t.body);
    toast({ title: "Template applied", description: t.label });
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast({ title: "Missing fields", description: "Add a title and message.", variant: "destructive" });
      return;
    }
    if (selected.length === 0) {
      toast({ title: "No segments selected", description: "Pick at least one audience segment.", variant: "destructive" });
      return;
    }

    // Announcement mode = kept as UI-only for now
    if (tab === "announcement") {
      toast({
        title: schedule ? "Announcement scheduled" : "Announcement published",
        description: `${selected.length} segment${selected.length !== 1 ? "s" : ""}${schedule ? " · " + scheduleDate : ""}.`,
      });
      setTitle(""); setBody(""); setSchedule(false); setScheduleDate("");
      return;
    }

    // Targeted message mode: actually send
    const channels: string[] = [];
    if (channelEmail) channels.push("email");
    if (channelInApp) channels.push("in_app");
    if (channels.length === 0) {
      toast({ title: "No channel", description: "Enable at least one delivery channel.", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-bulk-message", {
        body: { subject: title, body, segments: selected, channels, category },
      });
      if (error) throw error;
      if (data?.error) throw new Error(typeof data.error === "string" ? data.error : "Send failed");

      const { data: deliveries } = await supabase
        .from("message_deliveries")
        .select("*")
        .eq("bulk_message_id", data.bulk_message_id)
        .order("created_at", { ascending: true });

      setResult({
        bulkId: data.bulk_message_id,
        deliveries: deliveries ?? [],
        note: data.note,
      });
      toast({
        title: "Message sent",
        description: `${data.recipients} recipient${data.recipients !== 1 ? "s" : ""} · ${data.in_app_sent} in-app · ${data.email_sent} email${data.email_failed ? " · " + data.email_failed + " failed" : ""}.`,
      });
      setTitle(""); setBody("");
    } catch (e: any) {
      toast({ title: "Send failed", description: e.message ?? String(e), variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Zap size={22} className="text-gold" /> Bulk Actions
          </h1>
          <p className="text-sm text-muted-foreground">
            Create announcements and send targeted communications to selected member segments.
          </p>
        </div>
        <Badge variant="outline" className="border-gold/40 text-gold bg-gold/5">
          Super Admin only
        </Badge>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="announcement" className="gap-2">
            <Megaphone size={14} /> Announcement
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <MessageSquare size={14} /> Targeted Message
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 grid lg:grid-cols-5 gap-6">
          {/* Composer */}
          <div className="lg:col-span-3 bg-card rounded-xl border p-5 shadow-sm space-y-5">
            {/* Segments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Target segments</label>
                <div className="flex gap-2 text-xs">
                  <button onClick={selectAll} className="text-primary hover:underline">Select all</button>
                  <span className="text-muted-foreground">·</span>
                  <button onClick={clearAll} className="text-muted-foreground hover:underline">Clear</button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {SEGMENTS.map((s) => {
                  const active = selected.includes(s.key);
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => toggleSegment(s.key)}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition-all",
                        active
                          ? `${s.tint} border-2 shadow-sm`
                          : "border-border bg-background hover:bg-muted/50"
                      )}
                    >
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <Icon size={14} />
                        {s.label}
                      </span>
                      <span className="text-xs tabular-nums">{s.count}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                <span className="font-semibold text-foreground">{recipientCount}</span> recipient{recipientCount !== 1 && "s"} across {selected.length} segment{selected.length !== 1 && "s"}
              </p>
            </div>

            {/* Priority (announcements only) */}
            <TabsContent value="announcement" className="m-0 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => {
                    const Icon = p.icon;
                    const active = priority === p.value;
                    return (
                      <button
                        key={p.value}
                        onClick={() => setPriority(p.value)}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all",
                          active ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                        )}
                      >
                        <Icon size={13} className={active ? p.color : "text-muted-foreground"} />
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Checkbox id="pin" checked={pinToDashboard} onCheckedChange={(c) => setPinToDashboard(c === true)} />
                <label htmlFor="pin" className="text-sm cursor-pointer">
                  Pin to top of member dashboard
                </label>
              </div>
            </TabsContent>

            {/* Channels (email tab only) */}
            <TabsContent value="email" className="m-0 space-y-3">
              <label className="text-sm font-medium">Delivery channels</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setChannelEmail(!channelEmail)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all",
                    channelEmail ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                  )}
                >
                  <Mail size={14} /> Email
                </button>
                <button
                  onClick={() => setChannelInApp(!channelInApp)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all",
                    channelInApp ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                  )}
                >
                  <Bell size={14} /> In-app
                </button>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Quick templates</label>
                <div className="flex flex-wrap gap-2">
                  {QUICK_TEMPLATES.map((t) => (
                    <button
                      key={t.label}
                      onClick={() => applyTemplate(t)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {tab === "announcement" ? "Announcement title" : "Subject"}
              </label>
              <Input
                placeholder={tab === "announcement" ? "e.g. Annual Flagship Event 2026" : "Enter subject…"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                placeholder={tab === "announcement" ? "Write the announcement body…" : "Write your message… {first_name} is available."}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Placeholders: <code className="text-foreground">{"{first_name}"}</code>, <code className="text-foreground">{"{company}"}</code>, <code className="text-foreground">{"{event}"}</code>
              </p>
            </div>

            {/* Schedule */}
            <div className="flex flex-wrap items-center gap-3">
              <Checkbox id="sched" checked={schedule} onCheckedChange={(c) => setSchedule(c === true)} />
              <label htmlFor="sched" className="text-sm font-medium cursor-pointer">Schedule for later</label>
              {schedule && (
                <Input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-auto"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2 border-t">
              <Button variant="outline" onClick={() => { setTitle(""); setBody(""); }}>
                <Trash2 size={14} /> Clear
              </Button>
              <Button onClick={handleSend} className="gap-1.5" disabled={sending}>
                {sending ? <Loader2 size={14} className="animate-spin" /> : schedule ? <Clock size={14} /> : <Send size={14} />}
                {tab === "announcement"
                  ? (schedule ? "Schedule announcement" : "Publish announcement")
                  : sending ? "Sending…" : (schedule ? "Schedule send" : "Send now")}
              </Button>
            </div>
          </div>

          {/* Preview + recent */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-xl border p-4 shadow-sm space-y-3">
              <h3 className="text-sm font-semibold">Preview</h3>
              <div className="rounded-lg border bg-background p-4 space-y-2">
                {tab === "announcement" && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      priority === "urgent" && "border-destructive/40 text-destructive bg-destructive/5",
                      priority === "important" && "border-primary/40 text-primary bg-primary/5",
                      priority === "info" && "border-teal/40 text-teal bg-teal/5",
                    )}
                  >
                    {PRIORITIES.find((p) => p.value === priority)?.label}
                  </Badge>
                )}
                <p className="text-sm font-semibold leading-tight">
                  {title || <span className="text-muted-foreground italic">Title preview…</span>}
                </p>
                <p className="text-xs text-muted-foreground whitespace-pre-line line-clamp-6">
                  {body || "Message preview will appear here."}
                </p>
                <div className="flex flex-wrap gap-1 pt-2">
                  {selected.map((k) => {
                    const s = SEGMENTS.find((x) => x.key === k)!;
                    return (
                      <Badge key={k} variant="secondary" className="text-[10px]">{s.label}</Badge>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Recent bulk actions</h3>
              <div className="space-y-2">
                {recentActions.map((a) => (
                  <div key={a.id} className="bg-card rounded-lg border p-3 shadow-sm space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">{a.title}</p>
                      <Badge variant="outline" className="text-[10px] shrink-0 capitalize">{a.type}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{a.recipients} recipients</span>
                      <span>·</span>
                      <span>{a.at}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {a.segments.map((s) => (
                        <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Tabs>

      {/* Delivery status dialog */}
      <Dialog open={!!result} onOpenChange={(o) => !o && setResult(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Delivery status</DialogTitle>
            <DialogDescription>
              Per-recipient delivery results for this message.
              {result?.note && (
                <span className="block mt-2 text-xs text-destructive">{result.note}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto -mx-6 px-6">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b">
                <tr className="text-left">
                  <th className="py-2 pr-2">Recipient</th>
                  <th className="py-2 pr-2">Channel</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2">Sent at</th>
                </tr>
              </thead>
              <tbody>
                {(result?.deliveries ?? []).map((d) => (
                  <tr key={d.id} className="border-b last:border-0">
                    <td className="py-2 pr-2">
                      <div className="font-medium leading-tight">{d.recipient_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{d.recipient_email}</div>
                    </td>
                    <td className="py-2 pr-2 text-xs uppercase tracking-wide">{d.channel === "in_app" ? "In-app" : "Email"}</td>
                    <td className="py-2 pr-2">
                      <span className={cn(
                        "inline-flex items-center gap-1 text-xs font-medium",
                        d.status === "sent" && "text-teal",
                        d.status === "failed" && "text-destructive",
                        d.status === "queued" && "text-muted-foreground",
                      )}>
                        {d.status === "sent" && <CheckCircle2 size={12} />}
                        {d.status === "failed" && <XCircle size={12} />}
                        {d.status === "queued" && <Clock size={12} />}
                        {d.status}
                      </span>
                      {d.error && <div className="text-[10px] text-destructive mt-0.5 line-clamp-2">{d.error}</div>}
                    </td>
                    <td className="py-2 text-xs text-muted-foreground">
                      {d.sent_at ? new Date(d.sent_at).toLocaleTimeString() : "—"}
                    </td>
                  </tr>
                ))}
                {(!result?.deliveries || result.deliveries.length === 0) && (
                  <tr><td colSpan={4} className="py-6 text-center text-sm text-muted-foreground">No deliveries recorded.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}