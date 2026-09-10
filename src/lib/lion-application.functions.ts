import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Schema = z.object({
  applicationId: z.string().uuid(),
});

/** Emails the Impact Lions lead about an application the caller submitted. */
export const notifyLionApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => Schema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("lion_applications")
      .select("id, user_id, motivation, linkedin_url, referral_experience, payment_ack")
      .eq("id", data.applicationId)
      .maybeSingle();

    if (error || !row) return { ok: false as const };
    if (row.user_id !== context.userId) return { ok: false as const };

    const { data: profile } = await context.supabase
      .from("profiles")
      .select("first_name, last_name, email, company")
      .eq("id", context.userId)
      .maybeSingle();

    const { sendLionApplicationNotification } = await import("./lion-application.server");

    return sendLionApplicationNotification({
      applicationId: row.id,
      applicantName:
        [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "A member",
      applicantEmail: profile?.email ?? "",
      company: profile?.company ?? "",
      motivation: row.motivation ?? "",
      linkedinUrl: row.linkedin_url ?? "",
      referralExperience: row.referral_experience ?? "",
      paymentAck: !!row.payment_ack,
    });
  });
