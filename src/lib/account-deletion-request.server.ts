import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const DeletionRequestSchema = z.object({
  fullName: z.string().trim().min(1).max(160).optional().default(""),
  email: z.string().trim().email().max(255),
  accountType: z.string().trim().max(80).optional().default(""),
  reason: z.string().trim().max(1000).optional().default(""),
  details: z.string().trim().max(2000).optional().default(""),
  acknowledged: z.literal(true),
});

export type DeletionRequestInput = z.input<typeof DeletionRequestSchema>;

/** Store-review accounts must never be removed while an app review is in progress. */
export const PROTECTED_DELETION_EMAILS = [
  "apple-review@ajbn.co.uk",
  "support@ajbn.co.uk",
];

export async function runAccountDeletionRequest(rawInput: unknown) {
  const input = DeletionRequestSchema.parse(rawInput);
  const email = input.email.toLowerCase();

  if (PROTECTED_DELETION_EMAILS.includes(email)) {
    throw new Error("Review account cannot be deleted");
  }
  const reason = input.reason?.trim() ? input.reason.trim() : null;
  const fullName = input.fullName?.trim() ? input.fullName.trim() : null;
  const accountType = input.accountType?.trim() ? input.accountType.trim() : null;
  const details = input.details?.trim() ? input.details.trim() : null;

  const url = process.env["SUPABASE_URL"]!;
  const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"]!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data, error } = await admin
    .from("account_deletion_requests")
    .insert({
      email,
      reason,
      full_name: fullName,
      account_type: accountType,
      details,
      acknowledged: true,
    })
    .select("id, due_by")
    .single();

  if (error) {
    console.error("[account-deletion-request] insert failed", error.message);
    throw new Error("We could not record your request. Please email admin@ajbn.co.uk.");
  }

  const dueBy = new Date(data.due_by as string).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const reference = `ADR-${String(data.id).slice(0, 8).toUpperCase()}`;

  const { sendAppEmail } = await import("./email-send.server");
  const sendResult = await sendAppEmail(admin, "account-deletion-request", email, {
    idempotencyKey: `account-deletion-${data.id}`,
    templateData: { email, reason: reason ?? "", reference, due_by: dueBy },
  });
  const emailed = sendResult.sent;

  return { ok: true as const, reference, dueBy, emailed };
}
