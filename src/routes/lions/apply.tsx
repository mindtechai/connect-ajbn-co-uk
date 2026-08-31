import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import LionApplicationPage from "@/pages/LionApplication";

export const Route = createFileRoute("/lions/apply")({
  // Member-only area: kept out of search and AI crawler indexes.
  head: () => ({
    meta: [
      { title: "Impact Lions application | AJBN Connect" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <LionApplicationPage />
    </RequireAuth>
  ),
});
