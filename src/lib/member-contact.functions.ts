import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const REVIEWER_EMAIL = "apple-review@ajbn.co.uk";

export type MemberContact = { email: string | null; phone: string | null };

/**
 * Reveals a member's contact details for the signed-in caller.
 * The App Store review account never receives contact fields.
 */
export const revealMemberContact = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ memberId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }): Promise<MemberContact> => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("email")
      .eq("id", context.userId)
      .maybeSingle();

    if ((profile?.email ?? "").toLowerCase() === REVIEWER_EMAIL) {
      return { email: null, phone: null };
    }

    const { data: rows, error } = await context.supabase.rpc("reveal_member_contact", {
      _member_id: data.memberId,
    });
    if (error) throw new Error("Contact details could not be revealed.");

    const row = (rows as MemberContact[] | null)?.[0];
    return { email: row?.email ?? null, phone: row?.phone ?? null };
  });
