import { supabase } from "@/integrations/supabase/client";

export type InboxRow = {
  conversation_id: string;
  other_user_id: string;
  other_first_name: string | null;
  other_last_name: string | null;
  other_company: string | null;
  last_message_at: string | null;
  last_message_body: string | null;
  unread_count: number;
};

export type ChatMessage = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

async function requireSession() {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function listInbox(): Promise<InboxRow[]> {
  const session = await requireSession();
  if (!session) return [];
  const { data, error } = await supabase.rpc("messaging_inbox");
  if (error) {
    console.error("messaging_inbox failed", error);
    return [];
  }
  return (data ?? []) as InboxRow[];
}

export async function startOrGetConversation(otherUserId: string): Promise<string | null> {
  const session = await requireSession();
  if (!session) return null;
  const { data, error } = await supabase.rpc("start_or_get_conversation", { _other: otherUserId });
  if (error) {
    console.error("start_or_get_conversation failed", error);
    throw error;
  }
  return (data as string) ?? null;
}

export async function loadThread(conversationId: string): Promise<{
  otherUserId: string | null;
  messages: ChatMessage[];
} | null> {
  const session = await requireSession();
  if (!session) return null;
  const me = session.user.id;

  const { data: convo, error: convoError } = await supabase
    .from("conversations")
    .select("id, user_a, user_b")
    .eq("id", conversationId)
    .maybeSingle();
  if (convoError) {
    console.error("conversation read failed", convoError);
    return null;
  }
  if (!convo) return null;

  const { data: msgs, error: msgError } = await supabase
    .from("messages")
    .select("id, sender_id, body, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (msgError) console.error("messages read failed", msgError);

  return {
    otherUserId: convo.user_a === me ? convo.user_b : convo.user_a,
    messages: (msgs ?? []) as ChatMessage[],
  };
}

export async function sendMessage(conversationId: string, body: string) {
  const session = await requireSession();
  if (!session) throw new Error("Please sign in again to send messages.");
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: session.user.id,
    body,
  });
  if (error) throw error;
}

export async function markConversationRead(conversationId: string) {
  const session = await requireSession();
  if (!session) return;
  const { error } = await supabase.rpc("mark_conversation_read", { _conversation: conversationId });
  if (error) console.error("mark_conversation_read failed", error);
}

export async function lookupMember(userId: string) {
  const { data, error } = await supabase.rpc("member_directory_list");
  if (error) {
    console.error("member_directory_list failed", error);
    return null;
  }
  const row = (data ?? []).find((m) => m.id === userId);
  return row
    ? { first_name: row.first_name, last_name: row.last_name, company: row.company }
    : null;
}
