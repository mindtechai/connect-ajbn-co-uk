import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Schema = z.object({
  kind: z.enum(["auth", "transactional"]),
  templateName: z.string().min(1).max(64),
  recipientEmail: z.string().trim().email().max(254),
});

/** Super-admin only: sends a sample copy of one email template. */
export const sendTestEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => Schema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (error || !isAdmin) {
      throw new Error("Only super admins can send test emails.");
    }

    const { runSendTestEmail } = await import("./send-test-email.server");
    return runSendTestEmail({ ...data, actorId: context.userId });
  });
