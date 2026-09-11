import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ResetPasswordSchema = z.object({
  memberId: z.string().uuid(),
});

export const resetMemberPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => ResetPasswordSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (roleError || !isAdmin) throw new Error("Only super admins can reset member passwords.");

    const resetPassword = process.env["ADMIN_MEMBER_RESET_PASSWORD"];
    if (!resetPassword || resetPassword.length < 8) {
      throw new Error("The admin reset password is not configured.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: target, error: lookupError } = await supabaseAdmin.auth.admin.getUserById(data.memberId);
    if (lookupError || !target.user) throw new Error("Member account not found.");

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(data.memberId, {
      password: resetPassword,
      email_confirm: true,
    });
    if (updateError) throw new Error("Could not reset this member's password.");

    const { error: auditError } = await context.supabase.from("admin_audit_log").insert({
      actor_id: context.userId,
      action: "reset_member_password",
      target_type: "user",
      target_id: data.memberId,
      details: { email: target.user.email ?? null },
    });
    if (auditError) throw new Error("Password changed, but the audit entry could not be recorded.");

    return { ok: true as const };
  });