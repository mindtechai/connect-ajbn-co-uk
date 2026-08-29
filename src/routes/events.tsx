import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import EventsPage from "@/pages/Events";

export const Route = createFileRoute("/events")({
  component: () => (
    <RequireAuth>
      <EventsPage />
    </RequireAuth>
  ),
});
