import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import PendingPage from "@/pages/Pending";

export const Route = createFileRoute("/pending")({
  // Member-only status screen: kept out of search and AI crawler indexes.
  head: () => ({
    meta: [
      { title: "Membership pending approval | AJBN Connect" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <PendingPage />
    </RequireAuth>
  ),
});
