import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

export const DeletionRequestSchema = z.object({
  email: z.string().trim().email().max(255),
  reason: z.string().trim().max(1000).optional().default(""),
  acknowledged: z.literal(true),
});

export type DeletionRequestInput = z.input<typeof DeletionRequestSchema>;

export async function runAccountDeletionRequest(rawInput: unknown) {
  const input = DeletionRequestSchema.parse(rawInput);
  const email = input.email.toLowerCase();
  const reason = input.reason?.trim() ? input.reason.trim() : null;

  const url = process.env["SUPABASE_URL"]!;
  const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"]!;
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

  const { data, error } = await admin
    .from("account_deletion_requests")
    .insert({ email, reason, acknowledged: true })
    .select("id, due_by")
    .single();

  if (error) {
    console.error("[account-deletion-request] insert failed", error.message);
    throw new Error("We could not record your request. Please email russell@ajbn.co.uk.");
  }

  const dueBy = new Date(data.due_by as string).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const reference = `ADR-${String(data.id).slice(0, 8).toUpperCase()}`;

  let emailed = false;
  try {
    const { error: sendErr } = await admin.functions.invoke("send-transactional-email", {
      body: {
        templateName: "account-deletion-request",
        recipientEmail: email,
        idempotencyKey: `account-deletion-${data.id}`,
        templateData: { email, reason: reason ?? "", reference, due_by: dueBy },
      },
    });
    emailed = !sendErr;
    if (sendErr) console.error("[account-deletion-request] email failed", sendErr);
  } catch (e) {
    console.error("[account-deletion-request] email threw", e);
  }

  return { ok: true as const, reference, dueBy, emailed };
}
