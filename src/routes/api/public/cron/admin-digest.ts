import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { sendAppEmail } from "@/lib/email-send.server";
import type { DigestSection } from "@/lib/email-templates/admin-daily-digest";

const ADMIN_EMAIL = "admin@ajbn.co.uk";
const ADMIN_URL = "https://connect.ajbn.co.uk/admin";
const MAX_ITEMS = 15;

function fullName(p: { first_name?: string | null; last_name?: string | null; email?: string | null }) {
  const name = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
  return name || p.email || "Unknown member";
}

function section(
  title: string,
  items: string[],
  actionLabel: string,
): DigestSection | null {
  if (items.length === 0) return null;
  return {
    title,
    count: items.length,
    items: items.slice(0, MAX_ITEMS),
    action_url: ADMIN_URL,
    action_label: actionLabel,
  };
}

async function buildAndSend() {
  const admin = createClient(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
    { auth: { persistSession: false } },
  );

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const sections: DigestSection[] = [];

  // 1. Profile changes awaiting approval (any pending, not just last 24h)
  const { data: pending } = await admin
    .from("profiles")
    .select("first_name, last_name, email, logo_status, company_name_status, website_status")
    .or("logo_status.eq.pending,company_name_status.eq.pending,website_status.eq.pending");

  const pendingItems = (pending ?? []).map((p) => {
    const changes = [
      p.company_name_status === "pending" ? "company name" : null,
      p.logo_status === "pending" ? "logo" : null,
      p.website_status === "pending" ? "website" : null,
    ].filter(Boolean);
    return `${fullName(p)} — ${changes.join(", ")}`;
  });
  const s1 = section("Profile changes awaiting approval", pendingItems, "Review profile changes");
  if (s1) sections.push(s1);

  // 2. New service enquiries
  const { data: enquiries } = await admin
    .from("service_enquiries")
    .select("name, email, service_type")
    .gte("created_at", since)
    .order("created_at", { ascending: false });
  const s2 = section(
    "New service enquiries",
    (enquiries ?? []).map((e) => `${e.name || e.email} — ${e.service_type}`),
    "Review enquiries",
  );
  if (s2) sections.push(s2);

  // 3. New introduction requests
  const { data: intros } = await admin
    .from("member_intro_requests")
    .select("target_name, target_company, status")
    .gte("created_at", since)
    .order("created_at", { ascending: false });
  const s3 = section(
    "New introduction requests",
    (intros ?? []).map((i) =>
      `${i.target_name}${i.target_company ? ` (${i.target_company})` : ""} — ${i.status}`,
    ),
    "Review introduction requests",
  );
  if (s3) sections.push(s3);

  // 4. New account deletion requests
  const { data: deletions } = await admin
    .from("account_deletion_requests")
    .select("email, due_by, status")
    .gte("created_at", since)
    .order("created_at", { ascending: false });
  const s4 = section(
    "New account deletion requests",
    (deletions ?? []).map(
      (d) => `${d.email} — ${d.status}, complete by ${new Date(d.due_by).toLocaleDateString("en-GB")}`,
    ),
    "Review deletion requests",
  );
  if (s4) sections.push(s4);

  // 5. New sign-ups
  const { data: signups } = await admin
    .from("profiles")
    .select("first_name, last_name, email, company")
    .gte("created_at", since)
    .order("created_at", { ascending: false });
  const s5 = section(
    "New members signed up",
    (signups ?? []).map((p) => `${fullName(p)}${p.company ? ` — ${p.company}` : ""}`),
    "Review new members",
  );
  if (s5) sections.push(s5);

  // 6. New Impact Lion applications
  const { data: lions } = await admin
    .from("lion_applications")
    .select("user_id, status")
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  let lionItems: string[] = [];
  if ((lions ?? []).length > 0) {
    const ids = (lions ?? []).map((l) => l.user_id);
    const { data: lionProfiles } = await admin
      .from("profiles")
      .select("id, first_name, last_name, email")
      .in("id", ids);
    const byId = new Map((lionProfiles ?? []).map((p) => [p.id, p]));
    lionItems = (lions ?? []).map((l) => {
      const p = byId.get(l.user_id);
      return `${p ? fullName(p) : "Member"} — ${l.status}`;
    });
  }
  const s6 = section("New Impact Lion applications", lionItems, "Review applications");
  if (s6) sections.push(s6);

  if (sections.length === 0) {
    return { sent: false, reason: "nothing_to_report" as const };
  }

  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/London",
  });

  const result = await sendAppEmail(admin, "admin-daily-digest", ADMIN_EMAIL, {
    idempotencyKey: `admin-digest-${today.toISOString().slice(0, 10)}`,
    templateData: { date_label: dateLabel, sections },
  });

  return { sent: result.sent, sections: sections.length };
}

export const Route = createFileRoute("/api/public/cron/admin-digest")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["ADMIN_DIGEST_SECRET"];
        const provided = request.headers.get("x-digest-secret");
        if (!secret || provided !== secret) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          const outcome = await buildAndSend();
          return new Response(JSON.stringify({ ok: true, ...outcome }), {
            headers: { "Content-Type": "application/json" },
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown error";
          console.error("[admin-digest] failed", message);
          return new Response(JSON.stringify({ ok: false, error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
