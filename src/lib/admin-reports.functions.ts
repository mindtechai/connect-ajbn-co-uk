import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const REVIEWER_EMAIL = "apple-review@ajbn.co.uk";
type Ctx = { supabase: any; userId: string };

async function getAdminScope(context: Ctx): Promise<"full" | "moderation"> {
  const [{ data: isSuper }, { data: profile }] = await Promise.all([
    context.supabase.rpc("has_role", { _user_id: context.userId, _role: "super_admin" }),
    context.supabase.from("profiles").select("email").eq("id", context.userId).maybeSingle(),
  ]);
  if (isSuper) return "full";
  if (profile?.email === REVIEWER_EMAIL) return "moderation";
  throw new Error("Only admins can access this area.");
}

export type AdminReportRow = {
  id: string;
  reporter_id: string;
  reporter_name: string;
  reporter_email: string | null;
  target_id: string | null;
  target_name: string | null;
  reason: string;
  details: string | null;
  context: string;
  status: string;
  created_at: string;
};

export const listMemberReports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const scope = await getAdminScope(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rows } = await supabaseAdmin
      .from("member_reports")
      .select("id, reporter_id, target_id, target_name, reason, details, context, status, created_at")
      .order("created_at", { ascending: false })
      .limit(300);

    const ids = new Set<string>();
    for (const r of rows ?? []) {
      if (r.reporter_id) ids.add(r.reporter_id);
      if (r.target_id) ids.add(r.target_id);
    }

    const people = new Map<string, { first_name: string | null; last_name: string | null; email: string | null }>();
    if (ids.size) {
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", Array.from(ids));
      for (const p of profs ?? []) people.set(p.id, p);
    }

    const nameOf = (id: string | null) => {
      const p = id ? people.get(id) : undefined;
      return [p?.first_name ?? "", p?.last_name ?? ""].join(" ").trim() || "Member";
    };

    const out: AdminReportRow[] = (rows ?? []).map((r) => ({
      id: r.id,
      reporter_id: r.reporter_id,
      reporter_name: nameOf(r.reporter_id),
      reporter_email: scope === "full" ? (people.get(r.reporter_id)?.email ?? null) : null,
      target_id: r.target_id,
      target_name: r.target_id ? nameOf(r.target_id) : r.target_name,
      reason: r.reason,
      details: r.details,
      context: r.context ?? "profile",
      status: r.status ?? "open",
      created_at: r.created_at,
    }));
    return out;
  });

const statusSchema = z.object({
  reportId: z.string().uuid(),
  status: z.enum(["open", "reviewed", "resolved", "dismissed"]),
});

/** Dismiss / review / resolve a report. Every change is written to the audit log. */
export const setReportStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => statusSchema.parse(data))
  .handler(async ({ context, data }) => {
    await getAdminScope(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin
      .from("member_reports")
      .update({ status: data.status })
      .eq("id", data.reportId);
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("admin_audit_log").insert({
      actor_id: context.userId,
      action: `report_${data.status}`,
      target_type: "member_reports",
      target_id: data.reportId,
      details: { status: data.status },
    });

    return { ok: true as const, status: data.status };
  });

const removeSchema = z.object({ reportId: z.string().uuid() });

/**
 * Removes the reported member's live Needs & Offers posts and resolves the
 * report. Full admins only — the reviewer account must not delete real content.
 */
export const removeReportedContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => removeSchema.parse(data))
  .handler(async ({ context, data }) => {
    const scope = await getAdminScope(context);
    if (scope !== "full") throw new Error("Only full admins can remove content.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: report } = await supabaseAdmin
      .from("member_reports")
      .select("id, target_id")
      .eq("id", data.reportId)
      .maybeSingle();
    if (!report) throw new Error("Report not found");
    if (!report.target_id) throw new Error("This report is not linked to a member's content.");

    const { data: removed } = await supabaseAdmin
      .from("board_posts")
      .delete()
      .eq("author_id", report.target_id)
      .select("id");

    await supabaseAdmin
      .from("member_reports")
      .update({ status: "resolved" })
      .eq("id", data.reportId);

    await supabaseAdmin.from("admin_audit_log").insert({
      actor_id: context.userId,
      action: "report_remove_content",
      target_type: "member_reports",
      target_id: report.id,
      details: { member_id: report.target_id, removed_posts: removed?.length ?? 0 },
    });

    return { ok: true as const, removed: removed?.length ?? 0 };
  });
