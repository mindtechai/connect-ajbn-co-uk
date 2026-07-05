import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const BodySchema = z.object({
  subject: z.string().trim().min(1).max(300),
  body: z.string().trim().min(1).max(10000),
  segments: z.array(z.enum(["ajbn", "lions", "prospective", "expired", "board"])).min(1),
  channels: z.array(z.enum(["email", "in_app"])).min(1),
  category: z.enum(["announcements", "events", "renewals", "lions", "general"]).default("general"),
});

const SEGMENT_TO_ROLES: Record<string, string[]> = {
  ajbn: ["ajbn_member"],
  lions: ["impact_lion"],
  prospective: ["prospective_member"],
  expired: [],
  board: ["super_admin"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return json({ error: "Missing authorization" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    // Verify caller is super_admin
    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: rolesData } = await admin
      .from("user_roles").select("role").eq("user_id", userData.user.id);
    const isSuperAdmin = (rolesData ?? []).some((r) => r.role === "super_admin");
    if (!isSuperAdmin) return json({ error: "Forbidden" }, 403);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: parsed.error.flatten() }, 400);
    }
    const { subject, body, segments, channels, category } = parsed.data;

    // Resolve recipients
    const roleSet = new Set<string>();
    segments.forEach((s) => SEGMENT_TO_ROLES[s].forEach((r) => roleSet.add(r)));
    const roleList = Array.from(roleSet);

    let recipientIds: string[] = [];
    if (roleList.length > 0) {
      const { data: rr } = await admin
        .from("user_roles").select("user_id").in("role", roleList);
      recipientIds = Array.from(new Set((rr ?? []).map((r) => r.user_id)));
    }

    let recipients: { id: string; email: string; first_name: string | null; last_name: string | null }[] = [];
    if (recipientIds.length > 0) {
      const { data: profs } = await admin
        .from("profiles").select("id, email, first_name, last_name").in("id", recipientIds);
      recipients = (profs ?? []).filter((p) => p.email);
    }

    // Preferences: per recipient, per channel (default: enabled)
    const { data: prefs } = await admin
      .from("notification_preferences")
      .select("user_id, email_enabled, inapp_enabled")
      .eq("category", category)
      .in("user_id", recipientIds.length ? recipientIds : ["00000000-0000-0000-0000-000000000000"]);
    const prefMap = new Map<string, { email: boolean; inapp: boolean }>();
    for (const p of prefs ?? []) {
      prefMap.set(p.user_id, { email: p.email_enabled, inapp: p.inapp_enabled });
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
    for (const t of tokens ?? []) tokenMap.set(t.user_id, t.token);
    // Use a server-configured app URL — never trust the request Origin/Referer
    // header, since an admin with a custom HTTP client could point unsubscribe
    // links at an attacker-controlled domain.
    const origin = (Deno.env.get("APP_URL") ?? "https://ajbnconnect.lovable.app").replace(/\/$/, "");

    // Create bulk_messages row
    const { data: msg, error: msgErr } = await admin.from("bulk_messages").insert({
      created_by: userData.user.id,
      subject, body, segments, channels,
      recipient_count: recipients.length,
    }).select("id").single();
    if (msgErr) return json({ error: msgErr.message }, 500);

    const bulkId = msg.id;

    // Build delivery rows and in-app notifications
    const deliveryRows: any[] = [];
    const notifRows: any[] = [];

    for (const r of recipients) {
      const personalizedBody = body
        .replaceAll("{first_name}", r.first_name ?? "")
        .replaceAll("{last_name}", r.last_name ?? "");

      if (channels.includes("in_app") && allows(r.id, "inapp")) {
        notifRows.push({
          user_id: r.id,
          bulk_message_id: bulkId,
          title: subject,
          body: personalizedBody,
        });
        deliveryRows.push({
          bulk_message_id: bulkId,
          recipient_user_id: r.id,
          recipient_email: r.email,
          recipient_name: [r.first_name, r.last_name].filter(Boolean).join(" ") || null,
          channel: "in_app",
          status: "sent",
          sent_at: new Date().toISOString(),
        });
      } else if (channels.includes("in_app")) {
        deliveryRows.push({
          bulk_message_id: bulkId,
          recipient_user_id: r.id,
          recipient_email: r.email,
          recipient_name: [r.first_name, r.last_name].filter(Boolean).join(" ") || null,
          channel: "in_app",
          status: "suppressed",
          error: `Recipient disabled in-app for '${category}'`,
        });
      }

      if (channels.includes("email") && allows(r.id, "email")) {
        deliveryRows.push({
          bulk_message_id: bulkId,
          recipient_user_id: r.id,
          recipient_email: r.email,
          recipient_name: [r.first_name, r.last_name].filter(Boolean).join(" ") || null,
          channel: "email",
          status: "queued",
        });
      } else if (channels.includes("email")) {
        deliveryRows.push({
          bulk_message_id: bulkId,
          recipient_user_id: r.id,
          recipient_email: r.email,
          recipient_name: [r.first_name, r.last_name].filter(Boolean).join(" ") || null,
          channel: "email",
          status: "suppressed",
          error: `Recipient unsubscribed from '${category}' email`,
        });
      }
    }

    if (notifRows.length > 0) {
      await admin.from("notifications").insert(notifRows);
    }

    // Attempt email sending via Lovable Emails queue if available
    let emailSent = 0;
    let emailFailed = 0;
    let emailErrorNote: string | null = null;

    const emailRecipients = recipients.filter((r) => allows(r.id, "email"));
    if (channels.includes("email") && emailRecipients.length > 0) {
      // Try the Lovable-managed send-transactional-email function
      try {
        for (const r of emailRecipients) {
          const unsubUrl = origin && tokenMap.get(r.id)
            ? `${origin}/unsubscribe?token=${tokenMap.get(r.id)}&category=${category}`
            : "";
          const { error: sendErr } = await admin.functions.invoke("send-transactional-email", {
            body: {
              templateName: "bulk-message",
              recipientEmail: r.email,
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
            },
          });
          if (sendErr) {
            emailFailed++;
            const idx = deliveryRows.findIndex(
              (d) => d.channel === "email" && d.recipient_user_id === r.id
            );
            if (idx >= 0) {
              deliveryRows[idx].status = "failed";
              deliveryRows[idx].error = String(sendErr.message ?? sendErr);
            }
          } else {
            emailSent++;
            const idx = deliveryRows.findIndex(
              (d) => d.channel === "email" && d.recipient_user_id === r.id
            );
            if (idx >= 0) {
              deliveryRows[idx].status = "sent";
              deliveryRows[idx].sent_at = new Date().toISOString();
            }
          }
        }
      } catch (e) {
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

    return json({
      bulk_message_id: bulkId,
      recipients: recipients.length,
      in_app_sent: channels.includes("in_app") ? recipients.length : 0,
      email_sent: emailSent,
      email_failed: emailFailed,
      note: emailErrorNote,
    });
  } catch (e) {
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}