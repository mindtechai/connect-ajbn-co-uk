import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import LionApplicationPage from "@/pages/LionApplication";

export const Route = createFileRoute("/lions/apply")({
  component: () => (
    <RequireAuth>
      <LionApplicationPage />
    </RequireAuth>
  ),
});
