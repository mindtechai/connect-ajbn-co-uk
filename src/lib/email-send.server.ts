import type { SupabaseClient } from "@supabase/supabase-js";
import { EmailAPIError } from "@lovable.dev/email-js";
import { sendTemplateEmail } from "./email-templates/send-email";

type AnyClient = SupabaseClient<any, any, any>;

type LogStatus = "sent" | "suppressed" | "failed";

/** Appends a row to the app's own send history. Never decides the send result. */
async function logSend(
  admin: AnyClient,
  row: {
    template_name: string;
    recipient_email: string;
    status: LogStatus;
    error_message?: string | null;
  },
) {
  const { error } = await admin.from("email_send_log").insert({
    message_id: null,
    template_name: row.template_name,
    recipient_email: row.recipient_email,
    status: row.status,
    error_message: row.error_message ?? null,
  });
  if (error) {
    console.error("[email] failed to write send log", { code: error.code, message: error.message });
  }
}

export type AppEmailResult =
  | { sent: true }
  | { sent: false; reason: "recipient_suppressed" }
  | { sent: false; reason: "failed"; message: string };

/**
 * Sends one registered template to one recipient through Lovable's managed
 * email delivery and records the outcome in the app's send history.
 * A 429 is retried once after the server-provided cooldown.
 */
export async function sendAppEmail(
  admin: AnyClient,
  templateName: string,
  recipientEmail: string,
  options: { templateData?: Record<string, unknown>; idempotencyKey?: string; replyTo?: string } = {},
): Promise<AppEmailResult> {
  const attempt = () =>
    sendTemplateEmail(templateName, recipientEmail, {
      ...(options.templateData ? { templateData: options.templateData as Record<string, any> } : {}),
      ...(options.idempotencyKey ? { idempotencyKey: options.idempotencyKey } : {}),
      ...(options.replyTo ? { replyTo: options.replyTo } : {}),
    });

  try {
    let result;
    try {
      result = await attempt();
    } catch (error) {
      if (error instanceof EmailAPIError && error.status === 429) {
        const waitSeconds = Math.min(error.retryAfterSeconds ?? 5, 30);
        await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
        result = await attempt();
      } else {
        throw error;
      }
    }

    if (result.sent) {
      await logSend(admin, {
        template_name: templateName,
        recipient_email: recipientEmail,
        status: "sent",
      });
      return { sent: true };
    }

    await logSend(admin, {
      template_name: templateName,
      recipient_email: recipientEmail,
      status: "suppressed",
      error_message: "Recipient is suppressed (bounced, complained or unsubscribed)",
    });
    return { sent: false, reason: "recipient_suppressed" };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error("[email] send failed", { templateName, message });
    await logSend(admin, {
      template_name: templateName,
      recipient_email: recipientEmail,
      status: "failed",
      error_message: message,
    });
    return { sent: false, reason: "failed", message };
  }
}
