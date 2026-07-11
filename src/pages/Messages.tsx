import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useMessagingProfile } from "@/hooks/useMessagingProfile";
import { ActivateMessagingDialog } from "@/components/messaging/ActivateMessagingDialog";
import { MessageCircle, ChevronRight, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listInbox, type DemoConversation } from "@/lib/demoMessaging";

export default function MessagesPage() {
  const { isActive, activate } = useMessagingProfile();
  const [rows, setRows] = useState<DemoConversation[]>([]);
  const [showActivate, setShowActivate] = useState(false);

  const load = () => setRows(listInbox());

  useEffect(() => {
    if (!isActive) { setShowActivate(true); return; }
    load();
    const h = () => load();
    window.addEventListener("ajbn-demo-message", h);
    return () => window.removeEventListener("ajbn-demo-message", h);
  }, [isActive]);

  return (
    <AppLayout maxWidth="3xl">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-lg bg-teal/10 w-10 h-10 grid place-items-center shrink-0">
          <MessageCircle className="text-teal" size={18} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Inbox</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
            <ShieldCheck size={12} className="text-teal" />
            Messages route inside AJBN Connect — phone numbers and emails stay private.
          </p>
        </div>
      </div>

      {!isActive ? (
        <div className="bg-card border rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">Activate your chat inbox to start receiving direct messages from other AJBN members.</p>
          <Button onClick={() => setShowActivate(true)}>Activate My Chat Inbox</Button>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-card border rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">No conversations yet. Head to the <Link to="/directory" className="text-primary underline">Member Directory</Link> to start one.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl divide-y">
          {rows.map((r) => {
            const last = r.messages[r.messages.length - 1];
            return (
            <Link
              key={r.id}
              to={`/messages/${r.id}`}
              className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="rounded-full bg-primary/10 text-primary w-10 h-10 grid place-items-center font-semibold text-sm shrink-0">
                {(r.other_first_name?.[0] ?? "?").toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold truncate">
                    {r.other_first_name} {r.other_last_name}
                  </p>
                  {last && (
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(last.created_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
                {r.other_company && <p className="text-[11px] text-muted-foreground truncate">{r.other_company}</p>}
                <p className="text-xs text-muted-foreground truncate mt-0.5">{last?.body ?? "No messages yet"}</p>
              </div>
              {r.unread_count > 0 && <Badge className="bg-gold text-primary">{r.unread_count}</Badge>}
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </Link>
            );
          })}
        </div>
      )}

      <ActivateMessagingDialog
        open={showActivate}
        onOpenChange={setShowActivate}
        activate={activate}
        onActivated={load}
      />
    </AppLayout>
  );
}