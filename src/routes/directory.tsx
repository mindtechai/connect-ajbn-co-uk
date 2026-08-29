import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import DirectoryPage from "@/pages/Directory";

export const Route = createFileRoute("/directory")({
  component: () => (
    <RequireAuth>
      <DirectoryPage />
    </RequireAuth>
  ),
});
