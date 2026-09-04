import * as React from "react";
import { render } from "@react-email/render";
import { sendLovableEmail, EmailAPIError } from "@lovable.dev/email-js";
import { createClient } from "@supabase/supabase-js";

import { SignupEmail } from "./email-templates/signup";
import { InviteEmail } from "./email-templates/invite";
import { MagicLinkEmail } from "./email-templates/magic-link";
import { RecoveryEmail } from "./email-templates/recovery";
import { EmailChangeEmail } from "./email-templates/email-change";
import { ReauthenticationEmail } from "./email-templates/reauthentication";
import { TEMPLATES } from "./email-templates/registry";

const SITE_NAME = "AJBN Connect & Impact";
const SENDER_DOMAIN = "notify.connect.ajbn.co.uk";
const FROM_DOMAIN = "connect.ajbn.co.uk";
const ROOT_URL = `https://${FROM_DOMAIN}`;

const AUTH_TEMPLATES: Record<string, { component: React.ComponentType<any>; subject: string }> = {
  signup: { component: SignupEmail, subject: "[TEST] Confirm your email" },
  invite: { component: InviteEmail, subject: "[TEST] You've been invited" },
  magiclink: { component: MagicLinkEmail, subject: "[TEST] Your login link" },
  recovery: { component: RecoveryEmail, subject: "[TEST] Reset your password" },
  email_change: { component: EmailChangeEmail, subject: "[TEST] Confirm your new email" },
  reauthentication: { component: ReauthenticationEmail, subject: "[TEST] Your verification code" },
};

function authSampleProps(recipient: string) {
  return {
    siteName: SITE_NAME,
    siteUrl: ROOT_URL,
    recipient,
    email: recipient,
    oldEmail: recipient,
    newEmail: recipient,
    confirmationUrl: `${ROOT_URL}/test-link`,
    token: "123456",
  };
}

export type TestSendInput = {
  kind: "auth" | "transactional";
  templateName: string;
  recipientEmail: string;
  actorId: string;
};

/** Sends one sample copy of an auth or app email template. Super-admin only (checked by the caller). */
export async function runSendTestEmail(input: TestSendInput) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Email sending is not configured yet.");

  const admin = createClient(process.env["SUPABASE_URL"]!, process.env["SUPABASE_SERVICE_ROLE_KEY"]!, {
    auth: { persistSession: false },
  });

  // Rate limit — max 20 test sends per hour across the project
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from("email_send_log")
    .select("id", { count: "exact", head: true })
    .like("template_name", "test:%")
    .gte("created_at", oneHourAgo);
  if ((count ?? 0) >= 20) {
    throw new Error("Rate limit reached (20 test emails per hour). Try again later.");
  }

  let html: string;
  let text: string;
  let subject: string;

  if (input.kind === "auth") {
    const entry = AUTH_TEMPLATES[input.templateName];
    if (!entry) throw new Error(`Unknown auth template: ${input.templateName}`);
    const element = React.createElement(entry.component, authSampleProps(input.recipientEmail));
    html = await render(element);
    text = await render(element, { plainText: true });
    subject = entry.subject;
  } else {
    const entry = TEMPLATES[input.templateName];
    if (!entry) throw new Error(`Unknown app email template: ${input.templateName}`);
    const data = entry.previewData ?? {};
    const element = React.createElement(entry.component, data);
    html = await render(element);
    text = await render(element, { plainText: true });
    const resolved = typeof entry.subject === "function" ? entry.subject(data) : entry.subject;
    subject = `[TEST] ${resolved}`;
  }

  const messageId = crypto.randomUUID();
  const logName = `test:${input.templateName}`;

  const finish = async (status: "sent" | "suppressed" | "failed", errorMessage?: string) => {
    const { error } = await admin.from("email_send_log").insert({
      message_id: messageId,
      template_name: logName,
      recipient_email: input.recipientEmail,
      status,
      error_message: errorMessage ?? null,
    });
    if (error) console.error("[email] test send log failed", { code: error.code, message: error.message });
  };

  try {
    await sendLovableEmail(
      {
        to: input.recipientEmail,
        from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
        sender_domain: SENDER_DOMAIN,
        subject,
        html,
        text,
        purpose: "transactional",
        label: logName,
        idempotency_key: `test-${messageId}`,
      },
      { apiKey, sendUrl: process.env["LOVABLE_SEND_URL"] },
    );
  } catch (error) {
    if (error instanceof EmailAPIError && error.code === "recipient_suppressed") {
      await finish("suppressed", "Recipient is suppressed (bounced, complained or unsubscribed)");
      return { success: false as const, messageId, reason: "recipient_suppressed" as const };
    }
    const message = error instanceof Error ? error.message : "Unknown email error";
    await finish("failed", message);
    throw new Error(message);
  }

  await finish("sent");

  const { error: auditError } = await admin.from("admin_audit_log").insert({
    actor_id: input.actorId,
    action: "email.test_send",
    target_type: "email_template",
    details: {
      kind: input.kind,
      templateName: input.templateName,
      recipientEmail: input.recipientEmail,
      messageId,
    },
  });
  if (auditError) console.error("[email] audit log failed", { message: auditError.message });

  return { success: true as const, messageId };
}
