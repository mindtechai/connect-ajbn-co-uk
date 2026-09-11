import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import AccountSettingsPage from "@/pages/AccountSettings";

export const Route = createFileRoute("/settings/")({
  head: () => ({
    meta: [
      { title: "Account settings | AJBN Connect" },
      { name: "description", content: "Manage the password for your AJBN Connect member account." },
      { property: "og:title", content: "Account settings | AJBN Connect" },
      { property: "og:description", content: "Manage the password for your AJBN Connect member account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <AccountSettingsPage />
    </RequireAuth>
  ),
});