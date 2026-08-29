import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import ESGReportPage from "@/pages/ESGReport";

export const Route = createFileRoute("/esg")({
  component: () => (
    <RequireAuth>
      <ESGReportPage />
    </RequireAuth>
  ),
});
