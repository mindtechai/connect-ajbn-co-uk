import { createFileRoute } from "@tanstack/react-router";
import { RequireSuperAdmin } from "@/components/RequireSuperAdmin";
import AdminPage from "@/pages/Admin";

export const Route = createFileRoute("/admin/companies")({
  head: () => ({
    meta: [
      { title: "Companies | AJBN Connect admin" },
      { name: "description", content: "Manage AJBN company listings and their representatives." },
      { property: "og:title", content: "Companies | AJBN Connect admin" },
      { property: "og:description", content: "Manage AJBN company listings and their representatives." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <RequireSuperAdmin>
      <AdminPage />
    </RequireSuperAdmin>
  ),
});
