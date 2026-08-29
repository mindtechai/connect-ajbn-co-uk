import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { attachSupabaseAuth } from "@/lib/supabase-auth-middleware";
import { runDeleteAccount } from "@/lib/delete-account.server";

export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .handler(async () => {
    const authHeader = getRequestHeader("Authorization") ?? "";
    return runDeleteAccount(authHeader);
  });
