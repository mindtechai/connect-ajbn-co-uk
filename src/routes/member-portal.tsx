import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import MemberPortalPage from "@/pages/MemberPortal";

export const Route = createFileRoute("/member-portal")({
  // Member-only area: kept out of search and AI crawler indexes.
  head: () => ({
    meta: [
      { title: "Member Portal | AJBN Connect" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <MemberPortalPage />
    </RequireAuth>
  ),
});
