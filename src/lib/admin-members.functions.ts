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

const REVIEWER_EMAIL = "apple-review@ajbn.co.uk";

async function getAdminScope(context: Ctx): Promise<"full" | "moderation"> {
  const [{ data: isSuper }, { data: profile }] = await Promise.all([
    context.supabase.rpc("has_role", { _user_id: context.userId, _role: "super_admin" }),
    context.supabase.from("profiles").select("email").eq("id", context.userId).maybeSingle(),
  ]);
  if (isSuper) return "full";
  if (profile?.email === REVIEWER_EMAIL) return "moderation";
  throw new Error("Only admins can access this area.");
}

async function assertAdmin(context: Ctx, required: "full" | "moderation" = "full") {
  const scope = await getAdminScope(context);
  if (required === "full" && scope !== "full") {
    throw new Error("You do not have permission to perform this action.");
  }
}

function displayName(first?: string | null, last?: string | null, email?: string | null) {
  const name = [first ?? "", last ?? ""].join(" ").trim();
  return name || email || "Unnamed";
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
    const scope = await getAdminScope(context);
    if (scope !== "full" && !data.approved) {
      throw new Error("Only full admins can remove approval.");
    }
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
    // Approval always tells the member; callers opt out explicitly with false.
    if (data.approved && data.sendWelcome !== false) {
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

/* ---------- member detail for admin ---------- */

export type AdminMemberDetail = {
  id: string;
  scope: "full" | "moderation";
  email?: string;
  phone?: string | null;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  title: string | null;
  industry: string | null;
  city: string | null;
  bio: string | null;
  linkedin: string | null;
  website: string | null;
  membership_tier: string;
  is_approved: boolean;
  roles: string[];
  created_at: string;
  hasCompanyMatch: boolean;
  corporateOwnerName?: string | null;
  posts: { id: string; kind: string; title: string; category: string; created_at: string }[];
  audit: { action: string; details: any; created_at: string }[];
};

export const getAdminMemberDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ memberId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const scope = await getAdminScope(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, email, phone, first_name, last_name, company, title, industry, city, bio, linkedin, website, membership_tier, is_approved, created_at"
      )
      .eq("id", data.memberId)
      .maybeSingle();

    if (!profile) throw new Error("Member not found.");

    const [{ data: roles }, { data: auditRows }, { data: posts }, { data: companies }] = await Promise.all([
      supabaseAdmin.from("user_roles").select("role").eq("user_id", data.memberId),
      supabaseAdmin
        .from("admin_audit_log")
        .select("action, details, created_at")
        .eq("target_id", data.memberId)
        .order("created_at", { ascending: false })
        .limit(50),
      supabaseAdmin
        .from("board_posts")
        .select("id, kind, title, category, created_at")
        .eq("author_id", data.memberId)
        .order("created_at", { ascending: false })
        .limit(20),
      profile.company
        ? supabaseAdmin
            .from("corporate_members")
            .select("id, company_name, owner_user_id")
            .ilike("company_name", profile.company.trim())
        : Promise.resolve({ data: [] }),
    ]);

    const hasCompanyMatch = Boolean(companies && companies.length > 0);

    let corporateOwnerName: string | null = null;
    if (companies && companies.length === 1) {
      const { data: owners } = await supabaseAdmin
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", companies[0].owner_user_id)
        .maybeSingle();
      if (owners) corporateOwnerName = displayName(owners.first_name, owners.last_name);
    }

    const safe: AdminMemberDetail = {
      id: profile.id,
      scope,
      first_name: profile.first_name,
      last_name: profile.last_name,
      company: profile.company,
      title: profile.title,
      industry: profile.industry,
      city: profile.city,
      bio: profile.bio,
      linkedin: profile.linkedin,
      website: profile.website,
      membership_tier: profile.membership_tier,
      is_approved: profile.is_approved,
      roles: (roles ?? []).map((r: any) => r.role),
      created_at: profile.created_at,
      hasCompanyMatch,
      posts: (posts ?? []).map((p: any) => p),
      audit: (auditRows ?? []).map((a: any) => a),
    };

    if (scope === "full") {
      safe.email = profile.email;
      safe.phone = profile.phone;
      safe.corporateOwnerName = corporateOwnerName;
    }

    return safe;
  });

/* ---------- reject member ---------- */

const RejectSchema = z.object({
  memberId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

export const rejectMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => RejectSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context, "moderation");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("email, first_name, is_approved")
      .eq("id", data.memberId)
      .maybeSingle();

    await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.memberId)
      .in("role", ["ajbn_member", "impact_lion"]);

    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: data.memberId, role: "prospective_member" } as never);
    if (roleError && !/duplicate key/i.test(roleError.message)) throw new Error("Could not reject this member.");

    await supabaseAdmin
      .from("profiles")
      .update({ is_approved: false } as never)
      .eq("id", data.memberId);

    let emailSent = false;
    if (profile?.email) {
      const { sendAppEmail } = await import("@/lib/email-send.server");
      const result = await sendAppEmail(supabaseAdmin, "member-not-approved", profile.email, {
        templateData: { member_name: profile.first_name ?? "there", reason: data.reason },
      });
      emailSent = result.sent;
    }

    await audit(context, "reject_member", data.memberId, { reason: data.reason ?? "", email_sent: emailSent });
    return { ok: true as const, emailSent };
  });
