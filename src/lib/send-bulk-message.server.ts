import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

/** Ported from supabase/functions/send-bulk-message/index.ts */

export const BulkMessageSchema = z.object({
  subject: z.string().trim().min(1).max(300),
  body: z.string().trim().min(1).max(10000),
  segments: z.array(z.enum(["ajbn", "lions", "prospective", "expired", "board"])).min(1),
  channels: z.array(z.enum(["email", "in_app"])).min(1),
  category: z.enum(["announcements", "events", "renewals", "lions", "general"]).default("general"),
});

export type BulkMessageInput = z.infer<typeof BulkMessageSchema>;

const SEGMENT_TO_ROLES: Record<string, string[]> = {
  ajbn: ["ajbn_member"],
  lions: ["impact_lion"],
  prospective: ["prospective_member"],
  expired: [],
  board: ["super_admin"],
};

type DeliveryRow = {
  bulk_message_id: string;
  recipient_user_id: string;
  recipient_email: string;
  recipient_name: string | null;
  channel: "in_app" | "email";
  status: "sent" | "queued" | "suppressed" | "failed";
  sent_at?: string;
  error?: string;
};

function forbid(message: string, status: number): never {
  throw new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function runSendBulkMessage(authHeader: string, input: BulkMessageInput) {
  if (!authHeader) forbid("Missing authorization", 401);

  const SUPABASE_URL = process.env["SUPABASE_URL"]!;
  const SERVICE_KEY = process.env["SUPABASE_SERVICE_ROLE_KEY"]!;
  const ANON = process.env["SUPABASE_ANON_KEY"] ?? process.env["SUPABASE_PUBLISHABLE_KEY"]!;

  // Verify caller is super_admin
  const userClient = createClient(SUPABASE_URL, ANON, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData.user) forbid("Unauthorized", 401);

  const admin: SupabaseClient = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false },
  });
  const { data: rolesData } = await admin
    .from("user_roles").select("role").eq("user_id", userData.user.id);
  const isSuperAdmin = (rolesData ?? []).some((r) => r.role === "super_admin");
  if (!isSuperAdmin) forbid("Forbidden", 403);

  const { subject, body, segments, channels, category } = input;

  // Resolve recipients
  const roleSet = new Set<string>();
  segments.forEach((s) => (SEGMENT_TO_ROLES[s] ?? []).forEach((r) => roleSet.add(r)));
  const roleList = Array.from(roleSet);

  let recipientIds: string[] = [];
  if (roleList.length > 0) {
    const { data: rr } = await admin
      .from("user_roles").select("user_id").in("role", roleList);
    recipientIds = Array.from(new Set((rr ?? []).map((r) => r.user_id as string)));
  }

  let recipients: { id: string; email: string; first_name: string | null; last_name: string | null }[] = [];
  if (recipientIds.length > 0) {
    const { data: profs } = await admin
      .from("profiles").select("id, email, first_name, last_name").in("id", recipientIds);
    recipients = ((profs ?? []) as typeof recipients).filter((p) => p.email);
  }

  // Preferences: per recipient, per channel (default: enabled)
  const { data: prefs } = await admin
    .from("notification_preferences")
    .select("user_id, email_enabled, inapp_enabled")
    .eq("category", category)
    .in("user_id", recipientIds.length ? recipientIds : ["00000000-0000-0000-0000-000000000000"]);
  const prefMap = new Map<string, { email: boolean; inapp: boolean }>();
  for (const p of prefs ?? []) {
    prefMap.set(p.user_id as string, { email: !!p.email_enabled, inapp: !!p.inapp_enabled });
  }
  const allows = (uid: string, ch: "email" | "inapp") => {
    const p = prefMap.get(uid);
    return p ? (ch === "email" ? p.email : p.inapp) : true;
  };

  // Unsubscribe tokens
  const { data: tokens } = await admin
    .from("unsubscribe_tokens")
    .select("user_id, token")
    .in("user_id", recipientIds.length ? recipientIds : ["00000000-0000-0000-0000-000000000000"]);
  const tokenMap = new Map<string, string>();
  for (const t of tokens ?? []) tokenMap.set(t.user_id as string, t.token as string);
  // Use a server-configured app URL — never trust request headers.
  const origin = (process.env["APP_URL"] ?? "https://ajbnconnect.lovable.app").replace(/\/$/, "");

  // Create bulk_messages row
  const { data: msg, error: msgErr } = await admin.from("bulk_messages").insert({
    created_by: userData.user.id,
    subject, body, segments, channels,
    recipient_count: recipients.length,
  }).select("id").single();
  if (msgErr || !msg) forbid(msgErr?.message ?? "Insert failed", 500);

  const bulkId = msg.id as string;

  const deliveryRows: DeliveryRow[] = [];
  const notifRows: { user_id: string; bulk_message_id: string; title: string; body: string }[] = [];

  for (const r of recipients) {
    const personalizedBody = body
      .replaceAll("{first_name}", r.first_name ?? "")
      .replaceAll("{last_name}", r.last_name ?? "");
    const name = [r.first_name, r.last_name].filter(Boolean).join(" ") || null;

    if (channels.includes("in_app") && allows(r.id, "inapp")) {
      notifRows.push({ user_id: r.id, bulk_message_id: bulkId, title: subject, body: personalizedBody });
      deliveryRows.push({
        bulk_message_id: bulkId, recipient_user_id: r.id, recipient_email: r.email,
        recipient_name: name, channel: "in_app", status: "sent", sent_at: new Date().toISOString(),
      });
    } else if (channels.includes("in_app")) {
      deliveryRows.push({
        bulk_message_id: bulkId, recipient_user_id: r.id, recipient_email: r.email,
        recipient_name: name, channel: "in_app", status: "suppressed",
        error: `Recipient disabled in-app for '${category}'`,
      });
    }

    if (channels.includes("email") && allows(r.id, "email")) {
      deliveryRows.push({
        bulk_message_id: bulkId, recipient_user_id: r.id, recipient_email: r.email,
        recipient_name: name, channel: "email", status: "queued",
      });
    } else if (channels.includes("email")) {
      deliveryRows.push({
        bulk_message_id: bulkId, recipient_user_id: r.id, recipient_email: r.email,
        recipient_name: name, channel: "email", status: "suppressed",
        error: `Recipient unsubscribed from '${category}' email`,
      });
    }
  }

  if (notifRows.length > 0) {
    await admin.from("notifications").insert(notifRows);
  }

  // Email sending through Lovable's managed email delivery
  let emailSent = 0;
  let emailFailed = 0;
  let emailErrorNote: string | null = null;

  const emailRecipients = recipients.filter((r) => allows(r.id, "email"));
  if (channels.includes("email") && emailRecipients.length > 0) {
    const { sendAppEmail } = await import("./email-send.server");
    try {
      for (const r of emailRecipients) {
        const token = tokenMap.get(r.id);
        const unsubUrl = origin && token
          ? `${origin}/unsubscribe?token=${token}&category=${category}`
          : "";
        const result = await sendAppEmail(admin, "bulk-message", r.email, {
          idempotencyKey: `bulk-${bulkId}-${r.id}`,
          templateData: {
            subject,
            body: body
              .replaceAll("{first_name}", r.first_name ?? "")
              .replaceAll("{last_name}", r.last_name ?? ""),
            first_name: r.first_name ?? "",
            unsubscribe_url: unsubUrl,
            category,
          },
        });
        const idx = deliveryRows.findIndex(
          (d) => d.channel === "email" && d.recipient_user_id === r.id,
        );
        if (result.sent) {
          emailSent++;
          if (idx >= 0) {
            deliveryRows[idx]!.status = "sent";
            deliveryRows[idx]!.sent_at = new Date().toISOString();
          }
        } else if (result.reason === "recipient_suppressed") {
          if (idx >= 0) {
            deliveryRows[idx]!.status = "suppressed";
            deliveryRows[idx]!.error = "Recipient is suppressed (bounced, complained or unsubscribed)";
          }
        } else {
          emailFailed++;
          if (idx >= 0) {
            deliveryRows[idx]!.status = "failed";
            deliveryRows[idx]!.error = result.message;
          }
        }
      }

    } catch {
      emailErrorNote = "Email service not configured. Complete email domain setup to enable delivery.";
      for (const d of deliveryRows) {
        if (d.channel === "email" && d.status === "queued") {
          d.status = "failed";
          d.error = emailErrorNote;
          emailFailed++;
        }
      }
    }
  }

  if (deliveryRows.length > 0) {
    await admin.from("message_deliveries").insert(deliveryRows);
  }

  return {
    bulk_message_id: bulkId,
    recipients: recipients.length,
    in_app_sent: channels.includes("in_app") ? recipients.length : 0,
    email_sent: emailSent,
    email_failed: emailFailed,
    note: emailErrorNote,
  };
}
