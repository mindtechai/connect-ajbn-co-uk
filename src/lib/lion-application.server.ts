import { createClient } from "@supabase/supabase-js";
import { sendAppEmail } from "./email-send.server";

const LIONS_EMAIL = "salil@ajbn.co.uk";

export type LionApplicationNotification = {
  applicationId: string;
  applicantName: string;
  applicantEmail: string;
  company: string;
  motivation: string;
  linkedinUrl: string;
  referralExperience: string;
  paymentAck: boolean;
};

/** Emails the Impact Lions lead about a newly submitted application. */
export async function sendLionApplicationNotification(input: LionApplicationNotification) {
  const url = process.env["SUPABASE_URL"]!;
  const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"]!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const reference = `LION-${input.applicationId.slice(0, 8).toUpperCase()}`;

  const result = await sendAppEmail(admin, "lion-application", LIONS_EMAIL, {
    idempotencyKey: `lion-application-${input.applicationId}`,
    ...(input.applicantEmail ? { replyTo: input.applicantEmail } : {}),
    templateData: {
      applicant_name: input.applicantName,
      applicant_email: input.applicantEmail,
      company: input.company,
      motivation: input.motivation,
      linkedin_url: input.linkedinUrl,
      referral_experience: input.referralExperience,
      payment_ack: input.paymentAck,
      reference,
    },
  });

  if (!result.sent) return { ok: false as const, reference };
  return { ok: true as const, reference };
}
