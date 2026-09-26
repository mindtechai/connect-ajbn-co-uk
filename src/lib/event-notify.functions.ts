import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  eventKey: z.string().min(1).max(120),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  link: z.string().startsWith("/").max(300),
  force: z.boolean().optional(),
});

export const notifyEventAll = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "super_admin",
    });
    if (!isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (!data.force) {
      const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
      const { data: recent } = await supabaseAdmin
        .from("notifications")
        .select("created_at")
        .eq("event_key", data.eventKey)
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(1);
      if (recent && recent.length > 0) {
        return { alreadySent: true as const, sentAt: recent[0]?.created_at ?? null, count: 0 };
      }
    }

    const { data: members, error } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("is_approved", true)
      .is("deleted_at", null);
    if (error) throw new Error(error.message);

    const { data: prefs } = await supabaseAdmin
      .from("notification_preferences")
      .select("user_id, inapp_enabled")
      .eq("category", "announcements");
    const off = new Set((prefs ?? []).filter((p) => !p.inapp_enabled).map((p) => p.user_id));

    const rows = (members ?? [])
      .filter((m) => !off.has(m.id))
      .map((m) => ({
        user_id: m.id,
        title: data.title,
        body: data.body,
        link: data.link,
        event_key: data.eventKey,
      }));

    for (let i = 0; i < rows.length; i += 500) {
      const { error: insErr } = await supabaseAdmin.from("notifications").insert(rows.slice(i, i + 500));
      if (insErr) throw new Error(insErr.message);
    }

    await supabaseAdmin.from("admin_audit_log").insert({
      actor_id: context.userId,
      action: "notify_event",
      target_type: "event",
      details: { event_key: data.eventKey, title: data.title, count: rows.length },
    });

    return { alreadySent: false as const, sentAt: null, count: rows.length };
  });
