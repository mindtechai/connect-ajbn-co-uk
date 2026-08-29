import { createFileRoute } from "@tanstack/react-router";
import { RequireSuperAdmin } from "@/components/RequireSuperAdmin";
import AdminPage from "@/pages/Admin";

export const Route = createFileRoute("/admin/settings")({
  component: () => (
    <RequireSuperAdmin>
      <AdminPage />
    </RequireSuperAdmin>
  ),
});
