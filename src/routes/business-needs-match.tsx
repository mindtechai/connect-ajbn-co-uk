import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import AiMatcherPage from "@/pages/AiMatcher";

export const Route = createFileRoute("/business-needs-match")({
  // Alias of /ai-matcher. Member-only area: not indexed.
  head: () => ({
    meta: [
      { title: "Business Needs Match | AJBN Connect" },
      {
        name: "description",
        content:
          "Alias of the AJBN AI Business Needs Matcher for approved members.",
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
