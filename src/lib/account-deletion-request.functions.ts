import { createServerFn } from "@tanstack/react-start";
import type { DeletionRequestInput } from "@/lib/account-deletion-request.server";

export const requestAccountDeletion = createServerFn({ method: "POST" })
  .inputValidator((data: DeletionRequestInput) => data)
  .handler(async ({ data }) => {
    const { runAccountDeletionRequest } = await import(
      "@/lib/account-deletion-request.server"
    );
    return runAccountDeletionRequest(data);
  });
