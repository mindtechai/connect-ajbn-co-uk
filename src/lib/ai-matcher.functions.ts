import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { aiMatcherEnabledFor } from "./ai-matcher-flag";

const Schema = z.object({
  service: z.string().min(2).max(120),
  context: z.string().max(1200).optional(),
});

const RATE_LIMIT = 5; // requests per hour per member
const MAX_CANDIDATES_IN_PROMPT = 60;
const MAX_MATCHES = 6;

export type MatchCandidate = {
  key: string;
  kind: "member" | "company";
  name: string;
  business: string;
  member_id: string | null;
  company_id: string | null;
  reason: string;
};

export type MatchResult = {
  matches: MatchCandidate[];
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
  primary_sector: string | null;
  services_list: string[] | null;
};

type CompanyRow = {
  id: string;
  company_name: string;
  industry: string | null;
  city: string | null;
  job_title: string | null;
  short_bio: string | null;
  primary_sector: string | null;
  services_list: string[] | null;
};

/**
 * Matches a member's chosen service against the AJBN directory. The shortlist is
 * built deterministically from the service tags (exact match first) — the model
 * only ranks and explains, and may never invent a name. Only business
 * information is sent to the model, never emails, phone numbers or messages.
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

    const service = data.service.trim();

    const [{ data: directory }, { data: companyRows }] = await Promise.all([
      context.supabase.rpc("member_directory_list"),
      context.supabase
        .from("corporate_members")
        .select(
          "id,company_name,industry,city,job_title,short_bio,primary_sector,services_list",
        )
        .or(`primary_sector.eq.${service},services_list.cs.{"${service}"}`)
        .order("company_name", { ascending: true }),
    ]);

    const memberCandidates = ((directory ?? []) as DirectoryRow[])
      .filter((r) => r.id !== context.userId)
      .filter(
        (r) =>
          r.primary_sector === service || (r.services_list ?? []).includes(service),
      )
      .map((r) => ({
        key: `member-${r.id}`,
        kind: "member" as const,
        member_id: r.id,
        company_id: null,
        name: [r.first_name, r.last_name].filter(Boolean).join(" ") || "AJBN member",
        business: r.company ?? "",
        role: r.title ?? "",
        services: r.services_list ?? [],
        about: (r.bio ?? "").slice(0, 300),
      }));

    const companyCandidates = ((companyRows ?? []) as CompanyRow[]).map((c) => ({
      key: `company-${c.id}`,
      kind: "company" as const,
      member_id: null,
      company_id: c.id,
      name: c.company_name,
      business: c.company_name,
      role: c.job_title ?? "",
      services: c.services_list ?? [],
      about: [c.short_bio ?? "", c.city ?? ""].filter(Boolean).join(" — ").slice(0, 300),
    }));

    const candidates = [...memberCandidates, ...companyCandidates];

    if (candidates.length === 0) {
      await context.supabase
        .from("ai_matcher_requests")
        .insert({ user_id: context.userId, business_need: service });
      return {
        ok: true as const,
        result: { matches: [], referrals: [] } as MatchResult,
        remaining: RATE_LIMIT - (count ?? 0) - 1,
      };
    }

    const shortlist = candidates.slice(0, MAX_CANDIDATES_IN_PROMPT);
    const byKey = new Map(shortlist.map((c) => [c.key, c]));

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
              `You are the AJBN matcher for the Asian Jewish Business Network. Every candidate below is already tagged with the requested service, so do not question their relevance. Rank the ${MAX_MATCHES} most suitable candidates and give one referral opportunity. Each reason must quote or paraphrase only facts present in that candidate's own entry (business name, role, services, about text). Never speculate: do not write "sounds like", "potentially", "may be able to", "likely" or invent clients, locations or specialisms. If an entry has little detail, say plainly which service they are tagged with. Use only candidates from the provided list and copy their "key" exactly. Return JSON only, shaped as {"matches":[{"key":"","reason":""}],"referrals":[{"opportunity":""}]}.`,
          },
          {
            role: "user",
            content: `Requested service: ${service}\n${
              data.context?.trim() ? `Extra context from the member: ${data.context.trim()}\n` : ""
            }\nCandidates (JSON): ${JSON.stringify(
              shortlist.map(({ key, kind, name, business, role, services, about }) => ({
                key,
                kind,
                name,
                business,
                role,
                services,
                about,
              })),
            )}`,
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

    let parsed: { matches?: { key?: string; reason?: string }[]; referrals?: { opportunity?: string }[] };
    try {
      parsed = JSON.parse(json);
    } catch {
      return { ok: false as const, error: "ai_unavailable" as const };
    }

    const seen = new Set<string>();
    const ranked: MatchCandidate[] = [];
    for (const item of parsed.matches ?? []) {
      const candidate = item.key ? byKey.get(item.key) : undefined;
      if (!candidate || seen.has(candidate.key)) continue;
      seen.add(candidate.key);
      ranked.push({
        key: candidate.key,
        kind: candidate.kind,
        name: candidate.name,
        business: candidate.business,
        member_id: candidate.member_id,
        company_id: candidate.company_id,
        reason: String(item.reason ?? "").trim(),
      });
      if (ranked.length >= MAX_MATCHES) break;
    }

    // Deterministic safety net: never show fewer than we actually have tagged.
    for (const candidate of shortlist) {
      if (ranked.length >= MAX_MATCHES) break;
      if (seen.has(candidate.key)) continue;
      seen.add(candidate.key);
      ranked.push({
        key: candidate.key,
        kind: candidate.kind,
        name: candidate.name,
        business: candidate.business,
        member_id: candidate.member_id,
        company_id: candidate.company_id,
        reason: `Tagged in the AJBN directory under ${service}.`,
      });
    }

    const result: MatchResult = {
      matches: ranked.slice(0, MAX_MATCHES),
      referrals: (parsed.referrals ?? [])
        .slice(0, 1)
        .map((r) => ({ opportunity: String(r.opportunity ?? "") })),
    };

    await context.supabase
      .from("ai_matcher_requests")
      .insert({
        user_id: context.userId,
        business_need: [service, data.context?.trim()].filter(Boolean).join(" — ").slice(0, 1000),
      });

    return { ok: true as const, result, remaining: RATE_LIMIT - (count ?? 0) - 1 };
  });
