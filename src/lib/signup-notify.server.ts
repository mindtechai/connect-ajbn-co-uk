import { sendAppEmail } from "./email-send.server";

const APP_URL = "https://connect.ajbn.co.uk";
const ADMIN_EMAIL = "admin@ajbn.co.uk";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

/**
 * Sends the instant "new member needs approval" alert to the admin inbox and
 * the "pending approval" confirmation to the member. Idempotency keys make
 * repeat calls for the same sign-up harmless.
 */
export async function runSignupNotify(memberId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, first_name, last_name, email, company, phone, created_at, is_approved")
    .eq("id", memberId)
    .maybeSingle();

  if (!profile?.email) return { notified: false as const, reason: "unknown_member" as const };

  const createdAt = profile.created_at ? new Date(profile.created_at).getTime() : 0;
  if (!createdAt || Date.now() - createdAt > MAX_AGE_MS) {
    return { notified: false as const, reason: "not_a_new_signup" as const };
  }

  const name = [profile.first_name, profile.last_name].filter(Boolean).join(" ").trim() || profile.email;
  const signedUpOn = new Date(createdAt).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });

  const adminResult = await sendAppEmail(supabaseAdmin, "admin-new-signup", ADMIN_EMAIL, {
    idempotencyKey: `signup-admin-${profile.id}`,
    templateData: {
      member_name: name,
      company: profile.company ?? "",
      member_email: profile.email,
      member_phone: profile.phone ?? "",
      signed_up_on: signedUpOn,
      member_url: `${APP_URL}/admin/members/${profile.id}`,
      approvals_url: `${APP_URL}/admin/members?filter=pending`,
    },
  });

  const memberResult = await sendAppEmail(supabaseAdmin, "registration-pending", profile.email, {
    idempotencyKey: `signup-pending-${profile.id}`,
    templateData: { member_name: profile.first_name ?? "there" },
  });

  return {
    notified: true as const,
    adminSent: adminResult.sent,
    memberSent: memberResult.sent,
  };
}
