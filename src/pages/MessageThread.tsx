import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, Link } from "@/lib/router-compat";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, ShieldCheck, Ban, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MemberSafetyMenu } from "@/components/safety/MemberSafetyMenu";
import { isBlocked, syncBlocked } from "@/lib/moderation";
import {
  loadThread,
  lookupMember,
  markConversationRead,
  sendMessage,
  type ChatMessage,
} from "@/lib/messaging";

export default function MessageThreadPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [other, setOther] = useState<{ first_name: string | null; last_name: string | null; company: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sending, setSending] = useState(false);
  const [body, setBody] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    if (!conversationId) return;
    const thread = await loadThread(conversationId);
    if (!thread) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setOtherUserId(thread.otherUserId);
    setMessages(thread.messages);
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    void refresh();
    if (conversationId) void markConversationRead(conversationId);
    const poll = window.setInterval(() => void refresh(), 8000);
    return () => window.clearInterval(poll);
  }, [conversationId, refresh]);

  useEffect(() => {
    if (!otherUserId) return;
    void lookupMember(otherUserId).then(setOther);
  }, [otherUserId]);

  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    const sync = () => setBlocked(isBlocked(otherUserId ?? undefined));
    sync();
    void syncBlocked();
    window.addEventListener("ajbn-moderation-changed", sync);
    return () => window.removeEventListener("ajbn-moderation-changed", sync);
  }, [otherUserId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = body.trim();
    if (!text || !conversationId || blocked || sending) return;
    setSending(true);
    try {
      await sendMessage(conversationId, text);
      setBody("");
      await refresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not send message";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  const displayName = other
    ? `${other.first_name ?? ""} ${other.last_name ?? ""}`.trim() || "Member"
    : "Conversation";

  return (
    <AppLayout maxWidth="3xl" back={{ to: "/messages", label: "Inbox" }}>
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-full bg-primary/10 text-primary w-11 h-11 grid place-items-center font-semibold text-sm shrink-0">
          {(other?.first_name?.[0] ?? "?").toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-display font-bold leading-tight">{displayName}</h1>
          {other?.company && <p className="text-xs text-muted-foreground">{other.company}</p>}
        </div>
        {otherUserId && (
          <MemberSafetyMenu memberId={otherUserId} memberName={displayName} context="chat" />
        )}
      </div>

      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mb-3">
        <ShieldCheck size={12} className="text-teal" />
        End-to-end inside AJBN Connect. Contact details are never shared.
      </p>

      {blocked && (
        <div className="mb-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-muted-foreground flex items-start gap-2">
          <Ban size={14} className="text-destructive mt-0.5 shrink-0" />
          <span>
            You've blocked this member. They can't reach you here — use the menu above to unblock.
          </span>
        </div>
      )}

      <div className="bg-card border rounded-xl flex flex-col h-[70vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">Say hello 👋</p>
          ) : (
            messages.map((m) => {
              const mine = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words shadow-xs ${mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
                    {m.body}
                    <div className={`text-[10px] mt-1 ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>
        <div className="border-t p-3 flex items-end gap-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
            placeholder={blocked ? "You've blocked this member" : "Write a message…"}
            rows={2}
            disabled={blocked}
            className="resize-none"
          />
          <Button onClick={() => void send()} disabled={!body.trim() || blocked || sending} size="icon" aria-label="Send message">
            <Send size={16} />
          </Button>
        </div>
      </div>

      {notFound && (
        <p className="text-center text-sm text-muted-foreground mt-6">
          Conversation not found. <Link to="/messages" className="underline text-primary">Back to inbox</Link>
        </p>
      )}
    </AppLayout>
  );
}
