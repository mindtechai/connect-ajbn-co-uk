import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isUkQuietHours } from "@/lib/quietHours";

const ToggleSchema = z.object({
  memberId: z.string().uuid(),
  enabled: z.boolean(),
});

/** Super-admin only: switch a member's Quiet Hours preference from /admin/members. */
export const setMemberQuietHours = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => ToggleSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ quiet_hours_enabled: data.enabled })
      .eq("id", data.memberId);
    if (error) throw new Error(error.message);

    await context.supabase.from("admin_audit_log").insert({
      actor_id: context.userId,
      action: data.enabled ? "enable_quiet_hours" : "disable_quiet_hours",
      target_type: "user",
      target_id: data.memberId,
      details: { quiet_hours_enabled: data.enabled },
    });

    return { ok: true as const };
  });

const NotifySchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().min(1).max(4000),
});

/**
 * Called right after a chat message is sent. If the recipient is in Quiet Hours
 * we skip the in-app bell and email them instead.
 */
export const notifyQuietHoursMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => NotifySchema.parse(data))
  .handler(async ({ data, context }) => {
    if (!isUkQuietHours()) return { emailed: false as const };

    // Participation check runs as the caller, so RLS confirms they belong here.
    const { data: convo } = await context.supabase
      .from("conversations")
      .select("id, user_a, user_b")
      .eq("id", data.conversationId)
      .maybeSingle();
    if (!convo) return { emailed: false as const };

    const recipientId = convo.user_a === context.userId ? convo.user_b : convo.user_a;
    if (recipientId === context.userId) return { emailed: false as const };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: people } = await supabaseAdmin
      .from("profiles")
      .select("id, email, first_name, last_name, quiet_hours_enabled")
      .in("id", [recipientId, context.userId]);

    const recipient = (people ?? []).find((p) => p.id === recipientId);
    const sender = (people ?? []).find((p) => p.id === context.userId);
    if (!recipient?.quiet_hours_enabled || !recipient.email) {
      return { emailed: false as const };
    }

    const senderName = [sender?.first_name, sender?.last_name].filter(Boolean).join(" ")
      || "An AJBN member";

    const { sendTemplateEmail } = await import("@/lib/email-templates/send-email");
    await sendTemplateEmail("quiet-hours-message", recipient.email, {
      templateData: { sender_name: senderName, message_body: data.body },
    });

    return { emailed: true as const };
  });
