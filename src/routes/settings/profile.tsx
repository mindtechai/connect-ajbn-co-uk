import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import ProfilePage from "@/pages/Profile";

export const Route = createFileRoute("/settings/profile")({
  // Member-only area: kept out of search and AI crawler indexes.
  head: () => ({
    meta: [
      { title: "Profile settings | AJBN Connect" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  ),
});
