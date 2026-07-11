import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, ShieldCheck } from "lucide-react";
import {
  getConversation,
  sendMessage as sendDemoMessage,
  markRead,
  type DemoConversation,
  type DemoMsg,
} from "@/lib/demoMessaging";

export default function MessageThreadPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const [convo, setConvo] = useState<DemoConversation | null>(null);
  const [messages, setMessages] = useState<DemoMsg[]>([]);
  const [body, setBody] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const meId = user?.id ?? "demo-me";

  const refresh = () => {
    if (!conversationId) return;
    const c = getConversation(conversationId);
    if (c) {
      setConvo(c);
      setMessages(c.messages);
    }
  };

  useEffect(() => {
    refresh();
    if (conversationId) markRead(conversationId);
    const h = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d?.conversationId === conversationId) refresh();
    };
    window.addEventListener("ajbn-demo-message", h);
    return () => window.removeEventListener("ajbn-demo-message", h);
  }, [conversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = body.trim();
    if (!text || !conversationId) return;
    sendDemoMessage(conversationId, meId, text);
    setBody("");
    refresh();
  };
  const other = convo
    ? { first_name: convo.other_first_name, last_name: convo.other_last_name, company: convo.other_company }
    : null;
  const loading = false;

  return (
    <AppLayout maxWidth="3xl" back={{ to: "/messages", label: "Inbox" }}>
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-full bg-primary/10 text-primary w-11 h-11 grid place-items-center font-semibold text-sm shrink-0">
          {(other?.first_name?.[0] ?? "?").toUpperCase()}
        </div>
        <div>
          <h1 className="text-lg font-display font-bold leading-tight">
            {other ? `${other.first_name ?? ""} ${other.last_name ?? ""}`.trim() : "Conversation"}
          </h1>
          {other?.company && <p className="text-xs text-muted-foreground">{other.company}</p>}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mb-3">
        <ShieldCheck size={12} className="text-teal" />
        End-to-end inside AJBN Connect. Contact details are never shared.
      </p>

      <div className="bg-card border rounded-xl flex flex-col h-[70vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-12">Say hello 👋</p>
          ) : (
            messages.map((m) => {
              const mine = m.sender_id === user?.id;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words shadow-sm ${mine ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"}`}>
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
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Write a message…"
            rows={2}
            className="resize-none"
          />
          <Button onClick={send} disabled={!body.trim()} size="icon" aria-label="Send message">
            <Send size={16} />
          </Button>
        </div>
      </div>

      {!convo && !loading && (
        <p className="text-center text-sm text-muted-foreground mt-6">
          Conversation not found. <Link to="/messages" className="underline text-primary">Back to inbox</Link>
        </p>
      )}
    </AppLayout>
  );
}