import { createClient } from "@supabase/supabase-js";

/** Ported from supabase/functions/delete-account/index.ts */
export async function runDeleteAccount(authHeader: string): Promise<{ ok: true }> {
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) {
    throw new Response(JSON.stringify({ error: "Missing token" }), { status: 401 });
  }
  const url = process.env["SUPABASE_URL"]!;
  const serviceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"]!;
  const admin = createClient(url, serviceKey);

  const { data: userRes, error: userErr } = await admin.auth.getUser(jwt);
  if (userErr || !userRes.user) {
    throw new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const userId = userRes.user.id;

  // Delete profile row (cascades via FKs where configured); ignore missing rows.
  await admin.from("profiles").delete().eq("id", userId);

  // Delete auth user — cascades to any auth.users FK references.
  const { error: delErr } = await admin.auth.admin.deleteUser(userId);
  if (delErr) {
    throw new Error(delErr.message);
  }
  return { ok: true };
}
