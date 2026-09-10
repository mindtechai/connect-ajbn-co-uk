import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Schema = z.object({
  memberId: z.string().uuid(),
  field: z.enum(["logo", "company_name", "website"]),
  decision: z.enum(["approve", "reject"]),
});

/**
 * Super-admin only: promote or discard a member's proposed company name,
 * website or logo. The live columns are protected by a database trigger, so
 * this privileged path is the only way they can change.
 */
export const decideProfileChange = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => Schema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { data: row, error } = await context.supabase
      .from("profiles")
      .select("id, company, website, logo_url, pending_company_name, pending_website, pending_logo_url")
      .eq("id", data.memberId)
      .maybeSingle();
    if (error || !row) throw new Error("Member not found");

    const approve = data.decision === "approve";
    const patch: Record<string, unknown> = {};

    if (data.field === "logo") {
      if (approve && row.pending_logo_url) patch["logo_url"] = row.pending_logo_url;
      patch["pending_logo_url"] = null;
      patch["logo_status"] = "approved";
    } else if (data.field === "company_name") {
      if (approve && row.pending_company_name) patch["company"] = row.pending_company_name;
      patch["pending_company_name"] = null;
      patch["company_name_status"] = "approved";
    } else {
      if (approve && row.pending_website) patch["website"] = row.pending_website;
      patch["pending_website"] = null;
      patch["website_status"] = "approved";
    }

    const { error: updErr } = await context.supabase
      .from("profiles")
      .update(patch as never)
      .eq("id", data.memberId);
    if (updErr) throw new Error(updErr.message);

    await context.supabase.from("admin_audit_log").insert({
      actor_id: context.userId,
      action: `${data.decision}_profile_${data.field}`,
      target_type: "user",
      target_id: data.memberId,
      details: patch as never,
    });

    return { ok: true as const };
  });
