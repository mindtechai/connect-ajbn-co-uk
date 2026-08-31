import { createFileRoute } from "@tanstack/react-router";
import { RequireSuperAdmin } from "@/components/RequireSuperAdmin";
import AdminPage from "@/pages/Admin";

export const Route = createFileRoute("/admin/bulk-actions")({
  // Super-admin area: kept out of search and AI crawler indexes.
  head: () => ({
    meta: [
      { title: "Admin | AJBN Connect" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <RequireSuperAdmin>
      <AdminPage />
    </RequireSuperAdmin>
  ),
});
