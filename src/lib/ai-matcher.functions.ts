import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { aiMatcherEnabledFor } from "./ai-matcher-flag";

const Schema = z.object({
  businessNeed: z.string().min(20).max(1200),
});

const RATE_LIMIT = 5; // requests per hour per member
const MAX_MEMBERS_IN_PROMPT = 50;

export type MatchResult = {
  members: { name: string; business: string; reason: string; member_id: string }[];
  services: { name: string; reason: string }[];
  referrals: { opportunity: string }[];
};

type DirectoryRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  title: string | null;
  industry: string | null;
  bio: string | null;
  tags: string[] | null;
};

function keywords(need: string): string[] {
  return Array.from(
    new Set(
      need
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3),
    ),
  );
}

function score(row: DirectoryRow, words: string[]): number {
  const haystack = [row.company, row.title, row.industry, row.bio, (row.tags ?? []).join(" ")]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return words.reduce((n, w) => (haystack.includes(w) ? n + 1 : n), 0);
}

/**
 * Matches a member's business need against the AJBN directory using the
 * Lovable AI Gateway. Only business information is sent to the model — never
 * emails, phone numbers or private messages.
 */
export const matchBusinessNeed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => Schema.parse(data))
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("email, is_approved, deleted_at")
      .eq("id", context.userId)
      .maybeSingle();

    if (!aiMatcherEnabledFor(profile?.email)) {
      return { ok: false as const, error: "unavailable" as const };
    }

    const { data: approved } = await context.supabase.rpc("is_approved_member", {
      _uid: context.userId,
    });
    if (!approved) return { ok: false as const, error: "not_approved" as const };

    // Rate limit: 5 per rolling hour.
    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await context.supabase
      .from("ai_matcher_requests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .gte("created_at", since);

    if ((count ?? 0) >= RATE_LIMIT) {
      return { ok: false as const, error: "rate_limited" as const };
    }

    const { data: directory } = await context.supabase.rpc("member_directory_list");
    const rows = ((directory ?? []) as DirectoryRow[]).filter((r) => r.id !== context.userId);
    const words = keywords(data.businessNeed);
    const shortlist = [...rows]
      .map((r) => ({ r, s: score(r, words) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, MAX_MEMBERS_IN_PROMPT)
      .map(({ r }) => ({
        member_id: r.id,
        name: [r.first_name, r.last_name].filter(Boolean).join(" ") || "AJBN member",
        business: r.company ?? "",
        role: r.title ?? "",
        industry: r.industry ?? "",
        tags: r.tags ?? [],
        about: (r.bio ?? "").slice(0, 300),
      }));

    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false as const, error: "ai_unavailable" as const };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You are the AJBN matcher for the Asian Jewish Business Network. Given a member's business need and the member context provided, recommend the 3 most relevant members, 2 relevant services, and 1 referral opportunity. Keep it concise and business-focused, and explain the reason for each match. Use only members from the provided context and copy their member_id exactly. Return JSON only, shaped as {\"members\":[{\"name\":\"\",\"business\":\"\",\"reason\":\"\",\"member_id\":\"\"}],\"services\":[{\"name\":\"\",\"reason\":\"\"}],\"referrals\":[{\"opportunity\":\"\"}]}.",
          },
          {
            role: "user",
            content: `Business need: ${data.businessNeed}\n\nMember context (JSON): ${JSON.stringify(shortlist)}`,
          },
        ],
      }),
    });

    if (response.status === 429) return { ok: false as const, error: "rate_limited" as const };
    if (!response.ok) return { ok: false as const, error: "ai_unavailable" as const };

    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = payload.choices?.[0]?.message?.content ?? "";
    const json = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

    let parsed: MatchResult;
    try {
      parsed = JSON.parse(json) as MatchResult;
    } catch {
      return { ok: false as const, error: "ai_unavailable" as const };
    }

    const validIds = new Set(shortlist.map((m) => m.member_id));
    const result: MatchResult = {
      members: (parsed.members ?? [])
        .filter((m) => validIds.has(m.member_id))
        .slice(0, 3)
        .map((m) => ({
          member_id: m.member_id,
          name: String(m.name ?? ""),
          business: String(m.business ?? ""),
          reason: String(m.reason ?? ""),
        })),
      services: (parsed.services ?? [])
        .slice(0, 2)
        .map((s) => ({ name: String(s.name ?? ""), reason: String(s.reason ?? "") })),
      referrals: (parsed.referrals ?? [])
        .slice(0, 1)
        .map((r) => ({ opportunity: String(r.opportunity ?? "") })),
    };

    await context.supabase
      .from("ai_matcher_requests")
      .insert({ user_id: context.userId, business_need: data.businessNeed.slice(0, 1000) });

    return { ok: true as const, result, remaining: RATE_LIMIT - (count ?? 0) - 1 };
  });
