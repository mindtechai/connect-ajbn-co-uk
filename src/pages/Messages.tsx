import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useMessagingProfile } from "@/hooks/useMessagingProfile";
import { ActivateMessagingDialog } from "@/components/messaging/ActivateMessagingDialog";
import { MessageCircle, Loader2, ChevronRight, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type InboxRow = {
  conversation_id: string;
  other_user_id: string;
  other_first_name: string | null;
  other_last_name: string | null;
  other_company: string | null;
  last_message_at: string | null;
  last_message_body: string | null;
  unread_count: number;
};

export default function MessagesPage() {
  const { isActive, loading: profileLoading, activate } = useMessagingProfile();
  const [rows, setRows] = useState<InboxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showActivate, setShowActivate] = useState(false);

  const load = async () => {
    const { data } = await (supabase as any).rpc("messaging_inbox");
    setRows((data ?? []) as InboxRow[]);
    setLoading(false);
  };

  useEffect(() => {
    if (!profileLoading && !isActive) { setShowActivate(true); setLoading(false); return; }
    if (isActive) load();
  }, [isActive, profileLoading]);

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

      {!isActive && !profileLoading ? (
        <div className="bg-card border rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground mb-4">Activate your chat inbox to start receiving direct messages from other AJBN members.</p>
          <Button onClick={() => setShowActivate(true)}>Activate My Chat Inbox</Button>
        </div>
      ) : loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
      ) : rows.length === 0 ? (
        <div className="bg-card border rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">No conversations yet. Head to the <Link to="/directory" className="text-primary underline">Member Directory</Link> to start one.</p>
        </div>
      ) : (
        <div className="bg-card border rounded-xl divide-y">
          {rows.map((r) => (
            <Link
              key={r.conversation_id}
              to={`/messages/${r.conversation_id}`}
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
                  {r.last_message_at && (
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {formatDistanceToNow(new Date(r.last_message_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
                {r.other_company && <p className="text-[11px] text-muted-foreground truncate">{r.other_company}</p>}
                <p className="text-xs text-muted-foreground truncate mt-0.5">{r.last_message_body ?? "No messages yet"}</p>
              </div>
              {r.unread_count > 0 && <Badge className="bg-gold text-primary">{r.unread_count}</Badge>}
              <ChevronRight size={16} className="text-muted-foreground shrink-0" />
            </Link>
          ))}
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