import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import MessageThreadPage from "@/pages/MessageThread";

export const Route = createFileRoute("/messages/$conversationId")({
  // Member-only area: kept out of search and AI crawler indexes.
  head: () => ({
    meta: [
      { title: "Member conversation | AJBN Connect" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <MessageThreadPage />
    </RequireAuth>
  ),
});
