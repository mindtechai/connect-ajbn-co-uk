import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import NotificationPreferencesPage from "@/pages/NotificationPreferences";

export const Route = createFileRoute("/settings/notifications")({
  // Member-only area: kept out of search and AI crawler indexes.
  head: () => ({
    meta: [
      { title: "Notification settings | AJBN Connect" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <NotificationPreferencesPage />
    </RequireAuth>
  ),
});
