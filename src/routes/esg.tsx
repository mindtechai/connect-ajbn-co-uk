import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import ESGReportPage from "@/pages/ESGReport";

export const Route = createFileRoute("/esg")({
  // Member-only area: kept out of search and AI crawler indexes.
  head: () => ({
    meta: [
      { title: "ESG impact report | AJBN Connect" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ESGReportPage />
    </RequireAuth>
  ),
});
