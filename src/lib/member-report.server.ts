import { createClient } from "@supabase/supabase-js";

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

  try {
    const { error } = await admin.functions.invoke("send-transactional-email", {
      body: {
        templateName: "member-report",
        recipientEmail: TEAM_EMAIL,
        idempotencyKey: `member-report-${input.reportId}`,
        templateData: {
          reporter_name: input.reporterName,
          reporter_email: input.reporterEmail,
          target_name: input.targetName,
          reason: input.reason,
          details: input.details,
          context: input.context,
          reference,
        },
      },
    });
    if (error) {
      console.error("[member-report] email failed", error);
      return { ok: false as const, reference };
    }
  } catch (e) {
    console.error("[member-report] email threw", e);
    return { ok: false as const, reference };
  }

  return { ok: true as const, reference };
}
