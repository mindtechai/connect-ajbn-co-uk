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

async function assertAdmin(context: Ctx, required: "full" | "moderation" = "full") {
  const scope = await getAdminScope(context);
  if (required === "full" && scope !== "full") {
    throw new Error("You do not have permission to perform this action.");
  }
}

export type BlockRow = {
  id: string;
  blocker_id: string;
  blocked_id: string;
  blocker_name: string;
  blocker_company: string | null;
  blocked_name: string;
  blocked_company: string | null;
  created_at: string;
};

const unblockSchema = z.object({ blockId: z.string().uuid() });

export const listMemberBlocks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context, "moderation");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: rows } = await supabaseAdmin
      .from("member_blocks")
      .select("id, blocker_id, blocked_id, created_at")
      .order("created_at", { ascending: false })
      .limit(500);

    const ids = new Set<string>();
    for (const r of rows ?? []) {
      ids.add(r.blocker_id);
      ids.add(r.blocked_id);
    }

    const profiles = new Map<string, { first_name: string | null; last_name: string | null; company: string | null }>();
    if (ids.size) {
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("id, first_name, last_name, company")
        .in("id", Array.from(ids));
      for (const p of profs ?? []) profiles.set(p.id, p);
    }

    const out: BlockRow[] = (rows ?? []).map((r) => {
      const b1 = profiles.get(r.blocker_id);
      const b2 = profiles.get(r.blocked_id);
      return {
        id: r.id,
        blocker_id: r.blocker_id,
        blocked_id: r.blocked_id,
        blocker_name: [b1?.first_name ?? "", b1?.last_name ?? ""].join(" ").trim() || "Member",
        blocker_company: b1?.company ?? null,
        blocked_name: [b2?.first_name ?? "", b2?.last_name ?? ""].join(" ").trim() || "Member",
        blocked_company: b2?.company ?? null,
        created_at: r.created_at,
      };
    });
    return out;
  });

export const unblockMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => unblockSchema.parse(data))
  .handler(async ({ context, data }) => {
    await assertAdmin(context, "moderation");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row } = await supabaseAdmin
      .from("member_blocks")
      .select("id, blocker_id, blocked_id")
      .eq("id", data.blockId)
      .single();

    if (!row) throw new Error("Block not found");

    const { error } = await supabaseAdmin.from("member_blocks").delete().eq("id", data.blockId);
    if (error) throw new Error(error.message);

    await supabaseAdmin.from("admin_audit_log").insert({
      actor_id: context.userId,
      action: "unblock_member",
      target_type: "member_blocks",
      target_id: row.id,
      details: { blocker_id: row.blocker_id, blocked_id: row.blocked_id },
    });

    return { ok: true };
  });
