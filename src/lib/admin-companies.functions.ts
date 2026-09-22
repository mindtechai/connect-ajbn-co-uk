import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const MAX_REPS_PER_COMPANY = 3;

type Ctx = { supabase: any; userId: string };

/** Only full super admins may view or change company representatives. */
async function assertFullAdmin(context: Ctx) {
  const { data: isSuper } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "super_admin",
  });
  if (!isSuper) throw new Error("You do not have permission to access this area.");
}

export type CompanyRep = {
  id: string;
  name: string;
  email: string | null;
  title: string | null;
  is_primary: boolean;
};

export type CompanyRow = {
  id: string;
  company_name: string;
  primary_sector: string | null;
  city: string | null;
  owner_user_id: string | null;
  rep_count: number;
  reps: CompanyRep[];
};

/** Every company listing with its linked representatives (max 3 each). */
export const listCompaniesWithReps = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertFullAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ data: companies }, { data: profiles }] = await Promise.all([
      supabaseAdmin
        .from("corporate_members")
        .select("id, company_name, primary_sector, city, owner_user_id")
        .order("company_name", { ascending: true }),
      supabaseAdmin
        .from("profiles")
        .select("id, first_name, last_name, email, title, company_id")
        .not("company_id", "is", null)
        .is("deleted_at", null),
    ]);

    const byCompany = new Map<string, CompanyRep[]>();
    for (const p of profiles ?? []) {
      const key = p.company_id as string;
      const list = byCompany.get(key) ?? [];
      list.push({
        id: p.id,
        name: [p.first_name ?? "", p.last_name ?? ""].join(" ").trim() || "Member",
        email: p.email ?? null,
        title: p.title ?? null,
        is_primary: false,
      });
      byCompany.set(key, list);
    }

    const rows: CompanyRow[] = (companies ?? []).map((c) => {
      const reps = (byCompany.get(c.id) ?? []).map((r) => ({
        ...r,
        is_primary: r.id === c.owner_user_id,
      }));
      return {
        id: c.id,
        company_name: c.company_name,
        primary_sector: c.primary_sector ?? null,
        city: c.city ?? null,
        owner_user_id: c.owner_user_id ?? null,
        rep_count: reps.length,
        reps,
      };
    });
    return rows;
  });

const repSchema = z.object({
  companyId: z.string().uuid(),
  memberId: z.string().uuid(),
});

/** Unlinks a member from a company listing, freeing one of its three slots. */
export const removeCompanyRep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => repSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertFullAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ company_id: null })
      .eq("id", data.memberId)
      .eq("company_id", data.companyId);
    if (error) throw new Error(error.message);

    const { data: company } = await supabaseAdmin
      .from("corporate_members")
      .select("owner_user_id")
      .eq("id", data.companyId)
      .maybeSingle();
    if (company?.owner_user_id === data.memberId) {
      await supabaseAdmin
        .from("corporate_members")
        .update({ owner_user_id: null })
        .eq("id", data.companyId);
    }

    await supabaseAdmin.from("admin_audit_log").insert({
      actor_id: context.userId,
      action: "company_rep_removed",
      target_type: "corporate_member",
      target_id: data.companyId,
      details: { member_id: data.memberId },
    });

    return { ok: true as const };
  });

/** Marks one linked member as the company's primary representative. */
export const setPrimaryCompanyRep = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => repSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertFullAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", data.memberId)
      .eq("company_id", data.companyId)
      .maybeSingle();
    if (!profile) throw new Error("That member is not linked to this company.");

    const { error } = await supabaseAdmin
      .from("corporate_members")
      .update({ owner_user_id: data.memberId })
      .eq("id", data.companyId);
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("admin_audit_log").insert({
      actor_id: context.userId,
      action: "company_primary_rep_set",
      target_type: "corporate_member",
      target_id: data.companyId,
      details: { member_id: data.memberId },
    });

    return { ok: true as const };
  });
