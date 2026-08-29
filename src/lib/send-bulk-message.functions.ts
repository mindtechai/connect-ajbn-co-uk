import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { attachSupabaseAuth } from "@/lib/supabase-auth-middleware";
import { BulkMessageSchema, runSendBulkMessage } from "@/lib/send-bulk-message.server";

export const sendBulkMessage = createServerFn({ method: "POST" })
  .middleware([attachSupabaseAuth])
  .inputValidator((input: unknown) => BulkMessageSchema.parse(input))
  .handler(async ({ data }) => {
    const authHeader = getRequestHeader("Authorization") ?? "";
    return runSendBulkMessage(authHeader, data);
  });
