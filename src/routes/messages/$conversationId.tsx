import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import MessageThreadPage from "@/pages/MessageThread";

export const Route = createFileRoute("/messages/$conversationId")({
  component: () => (
    <RequireAuth>
      <MessageThreadPage />
    </RequireAuth>
  ),
});
