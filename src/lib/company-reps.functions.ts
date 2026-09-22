import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const MAX_REPS = 3;

const Schema = z.object({ company: z.string().min(2).max(200) });

export type RepAvailability = {
  companyName: string | null;
  repCount: number;
  full: boolean;
  /** First rep's display name, used in the "3 reps max" message. */
  firstRep: string | null;
};

/**
 * Tells the sign-up form whether a business already has its three
 * representatives. Returns counts only — never contact details.
 */
/** Same rule as the database helper: lowercase, strip punctuation and Ltd/Limited. */
export function normalizeCompanyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/(\s(ltd|limited|inc|llc|plc))+$/g, "")
    .trim();
}

export const checkCompanyRepAvailability = createServerFn({ method: "POST" })
  .inputValidator((data) => Schema.parse(data))
  .handler(async ({ data }): Promise<RepAvailability> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const normalized = normalizeCompanyName(data.company);
    if (!normalized) return { companyName: null, repCount: 0, full: false, firstRep: null };

    const { data: companies } = await supabaseAdmin
      .from("corporate_members")
      .select("id, company_name");

    const match = (companies ?? []).find(
      (c) => normalizeCompanyName(c.company_name) === normalized,
    );
    if (!match) return { companyName: null, repCount: 0, full: false, firstRep: null };

    const { data: reps } = await supabaseAdmin
      .from("profiles")
      .select("first_name, last_name")
      .eq("company_id", match.id)
      .is("deleted_at", null);

    const list = reps ?? [];
    const first = list[0];
    return {
      companyName: match.company_name,
      repCount: list.length,
      full: list.length >= MAX_REPS,
      firstRep: first
        ? [first.first_name ?? "", first.last_name ?? ""].join(" ").trim() || null
        : null,
    };
  });
