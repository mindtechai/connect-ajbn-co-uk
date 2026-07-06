// Public read-only Agent API for AJBN Connect.
// Exposes non-sensitive business directory + upcoming events to external AI
// agents (ChatGPT, Claude, custom bots) via Model Context Protocol compatible
// JSON endpoints. No login required; strict IP rate limiting enforced.

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-agent-key",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const RATE_LIMIT_PER_MIN = 30; // requests / minute / caller

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extra },
  });
}

async function rateLimit(callerKey: string): Promise<{ ok: boolean; remaining: number }> {
  const windowStart = new Date();
  windowStart.setSeconds(0, 0);
  const iso = windowStart.toISOString();

  const { data: existing } = await admin
    .from("agent_api_rate_limit")
    .select("id, request_count")
    .eq("caller_key", callerKey)
    .eq("window_start", iso)
    .maybeSingle();

  if (!existing) {
    await admin.from("agent_api_rate_limit").insert({ caller_key: callerKey, window_start: iso, request_count: 1 });
    return { ok: true, remaining: RATE_LIMIT_PER_MIN - 1 };
  }
  if (existing.request_count >= RATE_LIMIT_PER_MIN) return { ok: false, remaining: 0 };
  await admin
    .from("agent_api_rate_limit")
    .update({ request_count: existing.request_count + 1, updated_at: new Date().toISOString() })
    .eq("id", existing.id);
  return { ok: true, remaining: RATE_LIMIT_PER_MIN - existing.request_count - 1 };
}

function profileUrl(companySlug: string) {
  return `https://connect.ajbn.co.uk/directory?company=${encodeURIComponent(companySlug)}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = new URL(req.url);
  // Path after the function name, e.g. /agent-api/directory -> "directory"
  const parts = url.pathname.split("/").filter(Boolean);
  const route = parts[parts.length - 1] || "";

  // Rate limit by IP + optional agent key
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const agentKey = req.headers.get("x-agent-key") || "anon";
  const rl = await rateLimit(`${ip}:${agentKey}`);
  const rlHeaders = {
    "X-RateLimit-Limit": String(RATE_LIMIT_PER_MIN),
    "X-RateLimit-Remaining": String(rl.remaining),
  };
  if (!rl.ok) return json({ error: "Rate limit exceeded", limit_per_minute: RATE_LIMIT_PER_MIN }, 429, rlHeaders);

  try {
    if (route === "directory" || route === "public_member_directory") {
      const industry = url.searchParams.get("industry");
      const q = url.searchParams.get("q");
      const { data, error } = await admin.rpc("public_member_directory");
      if (error) return json({ error: error.message }, 500, rlHeaders);
      let rows = (data ?? []) as Array<{ company: string; industry: string; member_count: number; has_lion: boolean }>;
      if (industry) rows = rows.filter((r) => r.industry?.toLowerCase() === industry.toLowerCase());
      if (q) {
        const s = q.toLowerCase();
        rows = rows.filter((r) => r.company?.toLowerCase().includes(s));
      }
      const businesses = rows.map((r) => ({
        business_name: r.company,
        industry_sector: r.industry,
        london_region: null,
        website: null,
        member_count: r.member_count,
        impact_lion_member: r.has_lion,
        public_profile_url: profileUrl(r.company),
      }));
      return json({ count: businesses.length, businesses }, 200, rlHeaders);
    }

    if (route === "events" || route === "upcoming_events") {
      const nowIso = new Date().toISOString();
      const { data, error } = await admin
        .from("events")
        .select("id,title,description,starts_at,ends_at,location,kind,capacity,cover_image_url")
        .gte("starts_at", nowIso)
        .order("starts_at", { ascending: true })
        .limit(50);
      if (error) return json({ error: error.message }, 500, rlHeaders);
      const events = (data ?? []).map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        starts_at: e.starts_at,
        ends_at: e.ends_at,
        location: e.location,
        kind: e.kind,
        capacity: e.capacity,
        cover_image_url: e.cover_image_url,
        public_url: "https://connect.ajbn.co.uk/events",
      }));
      return json({ count: events.length, events }, 200, rlHeaders);
    }

    if (route === "" || route === "agent-api") {
      return json({
        service: "AJBN Connect Agent API",
        version: "1.0.0",
        description: "Public read-only endpoints for external AI agents.",
        openapi: "https://connect.ajbn.co.uk/openapi.json",
        mcp_manifest: "https://connect.ajbn.co.uk/.well-known/mcp.json",
        endpoints: [
          { path: "/directory", description: "Public business directory grouped by company + industry." },
          { path: "/events", description: "Upcoming public events." },
        ],
        rate_limit_per_minute: RATE_LIMIT_PER_MIN,
      }, 200, rlHeaders);
    }

    return json({ error: "Not found", available: ["/directory", "/events"] }, 404, rlHeaders);
  } catch (err) {
    return json({ error: (err as Error).message }, 500, rlHeaders);
  }
});