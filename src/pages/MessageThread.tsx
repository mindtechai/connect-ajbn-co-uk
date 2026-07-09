import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

type Msg = { id: string; sender_id: string; body: string; created_at: string };
type Convo = { id: string; user_a: string; user_b: string };

export default function MessageThreadPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const [convo, setConvo] = useState<Convo | null>(null);
  const [other, setOther] = useState<{ first_name: string | null; last_name: string | null; company: string | null } | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!conversationId || !user) return;
    let cancelled = false;
    (async () => {
      const { data: c } = await supabase.from("conversations").select("id,user_a,user_b").eq("id", conversationId).maybeSingle();
      if (cancelled) return;
      if (!c) { setLoading(false); return; }
      setConvo(c as Convo);
      const otherId = c.user_a === user.id ? c.user_b : c.user_a;
      const { data: p } = await supabase.from("profiles").select("first_name,last_name,company").eq("id", otherId).maybeSingle();
      setOther(p as any);
      const { data: m } = await supabase.from("messages").select("id,sender_id,body,created_at").eq("conversation_id", conversationId).order("created_at", { ascending: true });
      setMessages((m ?? []) as Msg[]);
      await (supabase as any).rpc("mark_conversation_read", { _conversation: conversationId });
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [conversationId, user]);

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        const m = payload.new as Msg;
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = body.trim();
    if (!text || !conversationId || !user) return;
    setSending(true);
    const { data, error } = await supabase
      .from("messages")
      .insert({ conversation_id: conversationId, sender_id: user.id, body: text })
      .select("id,sender_id,body,created_at")
      .single();
    setSending(false);
    if (error) { toast.error(error.message); return; }
    setMessages((prev) => (prev.some((x) => x.id === data!.id) ? prev : [...prev, data as Msg]));
    setBody("");
  };

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
          {loading ? (
            <div className="h-full grid place-items-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
          ) : messages.length === 0 ? (
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
          <Button onClick={send} disabled={sending || !body.trim()} size="icon" aria-label="Send message">
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