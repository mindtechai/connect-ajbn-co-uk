import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const REVIEWER_EMAIL = "apple-review@ajbn.co.uk";

type Ctx = { supabase: any; userId: string };
type AdminScope = "full" | "moderation";

async function getAdminScope(context: Ctx): Promise<AdminScope> {
  const [{ data: isSuper }, { data: profile }] = await Promise.all([
    context.supabase.rpc("has_role", { _user_id: context.userId, _role: "super_admin" }),
    context.supabase.from("profiles").select("email").eq("id", context.userId).maybeSingle(),
  ]);
  if (isSuper) return "full";
  if (profile?.email === REVIEWER_EMAIL) return "moderation";
  throw new Error("Only admins can access this area.");
}

async function assertAdmin(context: Ctx, required: AdminScope = "full") {
  const scope = await getAdminScope(context);
  if (required === "full" && scope !== "full") {
    throw new Error("You do not have permission to perform this action.");
  }
}

function daysAgo(n: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

function displayName(first?: string | null, last?: string | null, email?: string | null) {
  const name = [first ?? "", last ?? ""].join(" ").trim();
  return name || email || "Unnamed";
}

/* ---------- counts ---------- */

export type DashboardCounts = {
  total: number;
  approved: number;
  pending: number;
  newestPending: { id: string; name: string; company: string | null; hasCompanyMatch: boolean } | null;
  blocks: number;
  new24h: number;
  new7d: number;
};

export const getDashboardCounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context, "moderation");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [{ count: total }, { count: approved }, { count: pending }, { data: newest }, { count: blocks }, { count: new24h }, { count: new7d }] = await Promise.all([
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).is("deleted_at", null),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("is_approved", true).is("deleted_at", null),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).eq("is_approved", false).is("deleted_at", null),
      supabaseAdmin
        .from("profiles")
        .select("id, first_name, last_name, company")
        .eq("is_approved", false)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabaseAdmin.from("member_blocks").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()).is("deleted_at", null),
      supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", daysAgo(7)).is("deleted_at", null),
    ]);

    let hasCompanyMatch = false;
    if (newest?.company) {
      const { count } = await supabaseAdmin
        .from("corporate_members")
        .select("id", { count: "exact", head: true })
        .ilike("company_name", newest.company.trim());
      hasCompanyMatch = Boolean(count && count > 0);
    }

    return {
      total: total ?? 0,
      approved: approved ?? 0,
      pending: pending ?? 0,
      newestPending: newest
        ? {
            id: newest.id,
            name: displayName(newest.first_name, newest.last_name),
            company: newest.company,
            hasCompanyMatch,
          }
        : null,
      blocks: blocks ?? 0,
      new24h: new24h ?? 0,
      new7d: new7d ?? 0,
    } satisfies DashboardCounts;
  });

/* ---------- 30-day signup series ---------- */

export type SignupSeries = { date: string; count: number }[];

export const getSignupSeries = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context, "moderation");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const start = daysAgo(29); // include today → 30 days

    // Build series from profiles.created_at (no extra RPC required).
    const { data: rows } = await supabaseAdmin
      .from("profiles")
      .select("created_at")
      .gte("created_at", start)
      .is("deleted_at", null);
    const counts: Record<string, number> = {};
    for (const r of rows ?? []) {
      const d = new Date(r.created_at).toISOString().slice(0, 10);
      counts[d] = (counts[d] ?? 0) + 1;
    }
    const out: SignupSeries = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ date: key, count: counts[key] ?? 0 });
    }
    return out;
  });

/* ---------- activity feed ---------- */

export type ActivityItem = {
  id: string;
  type: "signup" | "need" | "offer" | "intro" | "enquiry" | "report";
  title: string;
  name: string;
  company: string | null;
  date: string;
  link: string;
};

export const getActivityFeed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context, "moderation");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = daysAgo(30);

    const [{ data: signups }, { data: posts }, { data: intros }, { data: enquiries }, { data: reports }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id, first_name, last_name, company, created_at")
        .gte("created_at", since)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(20),
      supabaseAdmin
        .from("board_posts")
        .select("id, kind, title, author_id, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(20),
      supabaseAdmin
        .from("member_intro_requests")
        .select("id, target_name, target_company, requester_id, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(20),
      supabaseAdmin
        .from("service_enquiries")
        .select("id, name, service_type, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(20),
      supabaseAdmin
        .from("member_reports")
        .select("id, reporter_id, target_name, reason, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    const profileIds = new Set<string>();
    for (const p of posts ?? []) if (p.author_id) profileIds.add(p.author_id);
    for (const i of intros ?? []) if (i.requester_id) profileIds.add(i.requester_id);
    for (const r of reports ?? []) if (r.reporter_id) profileIds.add(r.reporter_id);

    const profiles = new Map<string, { first_name: string | null; last_name: string | null; company: string | null; email: string | null }>();
    if (profileIds.size) {
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("id, first_name, last_name, company, email")
        .in("id", Array.from(profileIds));
      for (const p of profs ?? []) profiles.set(p.id, p);
    }

    const items: ActivityItem[] = [];
    for (const s of signups ?? []) {
      items.push({
        id: `signup-${s.id}`,
        type: "signup",
        title: "New member signed up",
        name: displayName(s.first_name, s.last_name),
        company: s.company,
        date: s.created_at,
        link: `/admin/members/${s.id}`,
      });
    }
    for (const p of posts ?? []) {
      const author = profiles.get(p.author_id);
      items.push({
        id: `post-${p.id}`,
        type: p.kind === "offer" ? "offer" : "need",
        title: `New ${p.kind}: ${p.title}`,
        name: displayName(author?.first_name, author?.last_name),
        company: author?.company ?? null,
        date: p.created_at,
        link: `/admin/members/${p.author_id}`,
      });
    }
    for (const i of intros ?? []) {
      const requester = profiles.get(i.requester_id);
      items.push({
        id: `intro-${i.id}`,
        type: "intro",
        title: `Introduction request: ${i.target_name}${i.target_company ? ` (${i.target_company})` : ""}`,
        name: displayName(requester?.first_name, requester?.last_name),
        company: requester?.company ?? null,
        date: i.created_at,
        link: "/admin/intros",
      });
    }
    for (const e of enquiries ?? []) {
      items.push({
        id: `enquiry-${e.id}`,
        type: "enquiry",
        title: `Service enquiry: ${e.service_type}`,
        name: e.name || "Anonymous",
        company: null,
        date: e.created_at,
        link: "/admin/enquiries",
      });
    }
    for (const r of reports ?? []) {
      const reporter = profiles.get(r.reporter_id);
      items.push({
        id: `report-${r.id}`,
        type: "report",
        title: `Report: ${r.reason}${r.target_name ? ` — ${r.target_name}` : ""}`,
        name: displayName(reporter?.first_name, reporter?.last_name),
        company: reporter?.company ?? null,
        date: r.created_at,
        link: "/admin/reports",
      });
    }

    items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return items.slice(0, 20);
  });
