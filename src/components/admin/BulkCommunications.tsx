import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Clock, Users, Crown, CalendarDays, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const recentMessages = [
  {
    id: "1",
    subject: "Q1 Networking Dinner – RSVP Reminder",
    audience: "All Members",
    sentDate: "15 Mar 2026",
    recipients: 162,
    openRate: "68%",
  },
  {
    id: "2",
    subject: "Impact Lions Golf Day Registration Open",
    audience: "Impact Lions",
    sentDate: "10 Mar 2026",
    recipients: 48,
    openRate: "82%",
  },
  {
    id: "3",
    subject: "New Mentorship Programme – Register Interest",
    audience: "All Members",
    sentDate: "1 Mar 2026",
    recipients: 155,
    openRate: "54%",
  },
  {
    id: "4",
    subject: "February Charity Impact Report",
    audience: "Impact Lions",
    sentDate: "28 Feb 2026",
    recipients: 42,
    openRate: "76%",
  },
];

export function BulkCommunications() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");
  const [schedule, setSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const { toast } = useToast();

  const audienceCount: Record<string, number> = {
    all: 162,
    ajbn: 114,
    lions: 48,
    expired: 22,
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please fill in the subject and message body.",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: schedule ? "Communication Scheduled" : "Communication Sent",
      description: `Message ${schedule ? "scheduled for " + scheduleDate : "sent"} to ${audienceCount[audience]} recipients.`,
    });
    setSubject("");
    setBody("");
    setSchedule(false);
    setScheduleDate("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Bulk Communications</h1>
        <p className="text-sm text-muted-foreground">Send announcements and updates to members</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Compose */}
        <div className="lg:col-span-3 bg-card rounded-xl border p-5 shadow-sm space-y-5">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Mail size={16} className="text-muted-foreground" /> Compose Message
          </h3>

          {/* Audience */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Audience</label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <span className="flex items-center gap-2"><Users size={14} /> All Members ({audienceCount.all})</span>
                </SelectItem>
                <SelectItem value="ajbn">
                  <span className="flex items-center gap-2"><Users size={14} /> AJBN Standard Only ({audienceCount.ajbn})</span>
                </SelectItem>
                <SelectItem value="lions">
                  <span className="flex items-center gap-2"><Crown size={14} /> Impact Lions Only ({audienceCount.lions})</span>
                </SelectItem>
                <SelectItem value="expired">
                  <span className="flex items-center gap-2"><Clock size={14} /> Expired Members ({audienceCount.expired})</span>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              This message will be sent to {audienceCount[audience]} recipient{audienceCount[audience] !== 1 && "s"}
            </p>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <Input
              placeholder="Enter email subject…"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              placeholder="Write your message here…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>

          {/* Schedule */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="schedule"
              checked={schedule}
              onCheckedChange={(checked) => setSchedule(checked === true)}
            />
            <label htmlFor="schedule" className="text-sm font-medium cursor-pointer">
              Schedule for later
            </label>
            {schedule && (
              <Input
                type="datetime-local"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
                className="w-auto"
              />
            )}
          </div>

          {/* Send */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setSubject(""); setBody(""); }}>
              Clear
            </Button>
            <Button onClick={handleSend}>
              {schedule ? <Clock size={14} /> : <Send size={14} />}
              {schedule ? "Schedule" : "Send Now"}
            </Button>
          </div>
        </div>

        {/* Recent messages */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-semibold">Recent Messages</h3>
          <div className="space-y-3">
            {recentMessages.map((msg) => (
              <div key={msg.id} className="bg-card rounded-xl border p-4 shadow-sm space-y-2">
                <p className="text-sm font-medium leading-tight">{msg.subject}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">{msg.audience}</Badge>
                  <span className="flex items-center gap-1">
                    <CalendarDays size={12} /> {msg.sentDate}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">{msg.recipients}</span> recipients
                  </span>
                  <span className="text-muted-foreground">
                    <span className="font-medium text-teal">{msg.openRate}</span> opened
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
