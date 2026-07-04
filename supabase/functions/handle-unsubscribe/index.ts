import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const CATEGORIES = ["announcements", "events", "renewals", "lions", "general"] as const;

const BodySchema = z.object({
  token: z.string().min(8).max(128),
  category: z.enum(CATEGORIES).optional(),
  channel: z.enum(["email", "in_app", "all"]).default("email"),
  resubscribe: z.boolean().optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(SUPABASE_URL, SERVICE_KEY);

  try {
    // GET => validate token
    if (req.method === "GET") {
      const url = new URL(req.url);
      const token = url.searchParams.get("token") ?? "";
      if (!token) return json({ valid: false, error: "Missing token" }, 400);
      const { data } = await admin.from("unsubscribe_tokens").select("user_id").eq("token", token).maybeSingle();
      return json({ valid: !!data });
    }

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);
    const { token, category, channel, resubscribe } = parsed.data;

    const { data: tok } = await admin
      .from("unsubscribe_tokens").select("user_id").eq("token", token).maybeSingle();
    if (!tok) return json({ error: "Invalid token" }, 404);
    const userId = tok.user_id as string;

    const categories = category ? [category] : CATEGORIES;
    const emailVal = channel === "in_app" ? undefined : !!resubscribe;
    const inappVal = channel === "email" ? undefined : !!resubscribe;

    for (const cat of categories) {
      const row: Record<string, unknown> = { user_id: userId, category: cat };
      if (emailVal !== undefined) row.email_enabled = emailVal;
      if (inappVal !== undefined) row.inapp_enabled = inappVal;
      await admin.from("notification_preferences").upsert(row, { onConflict: "user_id,category" });
    }

    return json({ ok: true, categories, channel, resubscribed: !!resubscribe });
  } catch (e) {
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}