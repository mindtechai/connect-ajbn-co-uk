import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Schema = z.object({ memberId: z.string().uuid() });

/**
 * Fired straight after a registration completes. Only ever sends the fixed
 * admin alert and member confirmation for a profile created in the last 24
 * hours, so it cannot be used to email arbitrary people.
 */
export const notifyNewSignup = createServerFn({ method: "POST" })
  .inputValidator((data) => Schema.parse(data))
  .handler(async ({ data }) => {
    const { runSignupNotify } = await import("./signup-notify.server");
    try {
      return await runSignupNotify(data.memberId);
    } catch (error) {
      console.error("[signup-notify] failed", error instanceof Error ? error.message : error);
      return { notified: false as const, reason: "failed" as const };
    }
  });
