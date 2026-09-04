import { createClient } from "@supabase/supabase-js";
import { sendAppEmail } from "./email-send.server";

const TEAM_EMAIL = "russell@ajbn.co.uk";

export type ReportNotification = {
  reportId: string;
  reporterName: string;
  reporterEmail: string;
  targetName: string;
  reason: string;
  details: string;
  context: string;
};

/** Emails the AJBN team about a newly submitted member report. */
export async function sendMemberReportNotification(input: ReportNotification) {
  const url = process.env["SUPABASE_URL"]!;
  const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"]!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const reference = `REP-${input.reportId.slice(0, 8).toUpperCase()}`;

  const result = await sendAppEmail(admin, "member-report", TEAM_EMAIL, {
    idempotencyKey: `member-report-${input.reportId}`,
    ...(input.reporterEmail ? { replyTo: input.reporterEmail } : {}),

    templateData: {
      reporter_name: input.reporterName,
      reporter_email: input.reporterEmail,
      target_name: input.targetName,
      reason: input.reason,
      details: input.details,
      context: input.context,
      reference,
    },
  });

  if (!result.sent) {
    return { ok: false as const, reference };
  }

  return { ok: true as const, reference };
}

