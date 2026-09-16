import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const APP_URL = "https://connect.ajbn.co.uk";

type Ctx = { supabase: any; userId: string };

async function assertSuperAdmin(context: Ctx) {
  const { data: isAdmin, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "super_admin",
  });
  if (error || !isAdmin) throw new Error("Only super admins can manage members.");
}

async function audit(context: Ctx, action: string, targetId: string, details: Record<string, unknown>) {
  await context.supabase.from("admin_audit_log").insert({
    actor_id: context.userId,
    action,
    target_type: "user",
    target_id: targetId,
    details,
  });
}

/* ---------- inline field edits ---------- */

const UpdateFieldsSchema = z.object({
  memberId: z.string().uuid(),
  fields: z
    .object({
      first_name: z.string().max(80).nullable().optional(),
      last_name: z.string().max(80).nullable().optional(),
      company: z.string().max(160).nullable().optional(),
      industry: z.string().max(120).nullable().optional(),
      city: z.string().max(120).nullable().optional(),
    })
    .refine((f) => Object.keys(f).length > 0, "No fields to update"),
});

export const updateMemberFields = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => UpdateFieldsSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update(data.fields as never)
      .eq("id", data.memberId);
    if (error) throw new Error("Could not save that change.");
    await audit(context, "edit_member_profile", data.memberId, data.fields);
    return { ok: true as const };
  });

/* ---------- role ---------- */

const RoleSchema = z.object({
  memberId: z.string().uuid(),
  role: z.enum(["prospective_member", "ajbn_member", "super_admin"]),
});

export const setMemberRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => RoleSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Impact Lion is an add-on and is never removed by a base-role change.
    await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.memberId)
      .in("role", ["prospective_member", "ajbn_member", "super_admin"]);

    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.memberId, role: data.role } as never);
    if (error && !/duplicate key/i.test(error.message)) throw new Error("Could not change the role.");

    const approved = data.role !== "prospective_member";
    await supabaseAdmin.from("profiles").update({ is_approved: approved } as never).eq("id", data.memberId);

    await audit(context, "set_member_role", data.memberId, { role: data.role });
    return { ok: true as const };
  });

/* ---------- approved toggle ---------- */

const ApprovedSchema = z.object({
  memberId: z.string().uuid(),
  approved: z.boolean(),
  sendWelcome: z.boolean().optional(),
});

export const setMemberApproved = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => ApprovedSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.approved) {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: data.memberId, role: "ajbn_member" } as never);
      if (error && !/duplicate key/i.test(error.message)) throw new Error("Could not approve this member.");
      await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.memberId)
        .eq("role", "prospective_member");
    } else {
      await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.memberId)
        .in("role", ["ajbn_member", "impact_lion"]);
      const { error } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: data.memberId, role: "prospective_member" } as never);
      if (error && !/duplicate key/i.test(error.message)) throw new Error("Could not update this member.");
    }

    await supabaseAdmin
      .from("profiles")
      .update({ is_approved: data.approved } as never)
      .eq("id", data.memberId);

    let welcomeSent = false;
    if (data.approved && data.sendWelcome) {
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("email, first_name")
        .eq("id", data.memberId)
        .maybeSingle();
      if (profile?.email) {
        const { sendAppEmail } = await import("@/lib/email-send.server");
        const result = await sendAppEmail(supabaseAdmin, "member-welcome", profile.email, {
          templateData: {
            member_name: profile.first_name ?? "there",
            login_url: `${APP_URL}/login`,
          },
        });
        welcomeSent = result.sent;
      }
    }

    await audit(context, data.approved ? "approve_member" : "unapprove_member", data.memberId, {
      welcome_email: welcomeSent,
    });
    return { ok: true as const, welcomeSent };
  });

/* ---------- membership tier ---------- */

const TierSchema = z.object({
  memberId: z.string().uuid(),
  tier: z.enum(["free", "corporate", "fully_paid"]),
});

export const setMembershipTier = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => TierSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ membership_tier: data.tier } as never)
      .eq("id", data.memberId);
    if (error) throw new Error("Could not change the membership level.");
    await audit(context, "set_membership_tier", data.memberId, { tier: data.tier });
    return { ok: true as const };
  });

/* ---------- soft delete ---------- */

const DeleteSchema = z.object({ memberId: z.string().uuid() });

export const softDeleteMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => DeleteSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    if (data.memberId === context.userId) throw new Error("You cannot delete your own account here.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ deleted_at: new Date().toISOString() } as never)
      .eq("id", data.memberId);
    if (error) throw new Error("Could not remove this member.");
    await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.memberId)
      .in("role", ["ajbn_member", "impact_lion", "super_admin"]);
    await audit(context, "soft_delete_member", data.memberId, {});
    return { ok: true as const };
  });

/* ---------- create member ---------- */

const CreateSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().max(80).optional().default(""),
  email: z.string().email(),
  company: z.string().max(160).optional().default(""),
  role: z.enum(["prospective_member", "ajbn_member", "super_admin"]),
});

export const createMemberAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => CreateSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
      data: { first_name: data.firstName, last_name: data.lastName, company: data.company },
      redirectTo: `${APP_URL}/login`,
    });
    if (error || !created?.user) {
      throw new Error(error?.message ?? "Could not create this member.");
    }

    const userId = created.user.id;
    await supabaseAdmin
      .from("profiles")
      .update({
        first_name: data.firstName,
        last_name: data.lastName || null,
        company: data.company || null,
        email: data.email,
        is_approved: data.role !== "prospective_member",
      } as never)
      .eq("id", userId);

    await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .in("role", ["prospective_member", "ajbn_member", "super_admin"]);
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: data.role } as never);
    if (roleError && !/duplicate key/i.test(roleError.message)) {
      throw new Error("Member created, but the role could not be set.");
    }

    await audit(context, "create_member", userId, { email: data.email, role: data.role });
    return { ok: true as const, memberId: userId };
  });
