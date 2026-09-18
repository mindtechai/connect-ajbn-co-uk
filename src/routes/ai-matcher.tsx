import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import AiMatcherPage from "@/pages/AiMatcher";

export const Route = createFileRoute("/ai-matcher")({
  // Member-only area: kept out of search and AI crawler indexes.
  head: () => ({
    meta: [
      { title: "AI Business Needs Matcher | AJBN Connect" },
      {
        name: "description",
        content:
          "Describe a business need and see the AJBN members, services and referral opportunities most relevant to it.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <AiMatcherPage />
    </RequireAuth>
  ),
});
