import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Schema = z.object({
  reportId: z.string().uuid(),
});

/** Notifies the AJBN team by email about a report the caller submitted. */
export const notifyMemberReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => Schema.parse(data))
  .handler(async ({ data, context }) => {
    // Only the reporter (or an admin) can trigger the notification, and RLS
    // ensures the row is visible only to them.
    const { data: row, error } = await context.supabase
      .from("member_reports")
      .select("id, reporter_id, target_name, reason, details, context")
      .eq("id", data.reportId)
      .maybeSingle();

    if (error || !row) return { ok: false as const };
    if (row.reporter_id !== context.userId) return { ok: false as const };

    const { data: profile } = await context.supabase
      .from("profiles")
      .select("first_name, last_name, email")
      .eq("id", context.userId)
      .maybeSingle();

    const { sendMemberReportNotification } = await import("./member-report.server");

    return sendMemberReportNotification({
      reportId: row.id,
      reporterName:
        [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "A member",
      reporterEmail: profile?.email ?? "",
      targetName: row.target_name ?? "Unknown member",
      reason: row.reason,
      details: row.details ?? "",
      context: row.context ?? "profile",
    });
  });
