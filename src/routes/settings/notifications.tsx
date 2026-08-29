import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import NotificationPreferencesPage from "@/pages/NotificationPreferences";

export const Route = createFileRoute("/settings/notifications")({
  component: () => (
    <RequireAuth>
      <NotificationPreferencesPage />
    </RequireAuth>
  ),
});
