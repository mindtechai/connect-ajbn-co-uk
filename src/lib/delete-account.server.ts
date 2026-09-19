import { createClient } from "@supabase/supabase-js";

type AdminClient = { from: (t: string) => any; auth: any };

/**
 * Permanently erases every trace of a member: owned company listings,
 * conversations and messages, deals, events, moderation rows, notifications,
 * referral links, roles, the profile row and finally the auth account.
 */
export async function purgeUserData(admin: AdminClient, userId: string): Promise<void> {
  // Conversations: messages reference the conversation, so clear those first.
  const { data: convs } = await admin
    .from("conversations")
    .select("id")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`);
  const convIds = (convs ?? []).map((c: { id: string }) => c.id);
  if (convIds.length) {
    await admin.from("messages").delete().in("conversation_id", convIds);
    await admin.from("conversations").delete().in("id", convIds);
  }
  await admin.from("messages").delete().eq("sender_id", userId);

  // Company listings owned by this member.
  await admin.from("corporate_members").delete().eq("owner_user_id", userId);

  // Referral links from other members must be cleared before the profile goes.
  await admin.from("profiles").update({ referred_by: null }).eq("referred_by", userId);

  const byUserId = [
    "deal_logs", "event_rsvps", "event_interests", "esg_contributions",
    "notifications", "notification_preferences", "messaging_profiles",
    "ai_matcher_requests", "reward_deposits", "unsubscribe_tokens",
    "lion_applications", "user_roles",
  ];
  for (const table of byUserId) {
    await admin.from(table).delete().eq("user_id", userId);
  }

  await admin.from("member_blocks").delete().eq("blocker_id", userId);
  await admin.from("member_blocks").delete().eq("blocked_id", userId);
  await admin.from("member_reports").delete().eq("reporter_id", userId);
  await admin.from("member_reports").delete().eq("target_id", userId);
  await admin.from("member_intro_requests").delete().eq("requester_id", userId);
  await admin.from("one_to_ones").delete().eq("requester_id", userId);
  await admin.from("one_to_ones").delete().eq("target_id", userId);
  await admin.from("ai_reports").delete().eq("reporter_id", userId);
  await admin.from("service_enquiries").delete().eq("user_id", userId);
  await admin.from("board_posts").delete().eq("author_id", userId);
  await admin.from("message_deliveries").delete().eq("recipient_user_id", userId);
  await admin.from("esg_contributions").delete().eq("recorded_by", userId);
  await admin.from("admin_audit_log").delete().eq("actor_id", userId);

  await admin.from("profiles").delete().eq("id", userId);

  const { error: delErr } = await admin.auth.admin.deleteUser(userId);
  if (delErr) throw new Error(delErr.message);
}

/** Ported from supabase/functions/delete-account/index.ts */
export async function runDeleteAccount(authHeader: string): Promise<{ ok: true }> {
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) {
    throw new Response(JSON.stringify({ error: "Missing token" }), { status: 401 });
  }
  const url = process.env["SUPABASE_URL"]!;
  const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"]!;
  const admin = createClient(url, serviceKey);

  const { data: userRes, error: userErr } = await admin.auth.getUser(jwt);
  if (userErr || !userRes.user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  await purgeUserData(admin as unknown as AdminClient, userRes.user.id);
  return { ok: true };
}
