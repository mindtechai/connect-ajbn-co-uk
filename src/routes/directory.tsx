import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import DirectoryPage from "@/pages/Directory";

export const Route = createFileRoute("/directory")({
  // Member-only area: kept out of search and AI crawler indexes.
  head: () => ({
    meta: [
      { title: "Member directory | AJBN Connect" },
      { name: "description", content: "Browse approved AJBN members and connect through secure member tools." },
      { property: "og:title", content: "Member directory | AJBN Connect" },
      { property: "og:description", content: "Browse approved AJBN members and connect through secure member tools." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <DirectoryPage />
    </RequireAuth>
  ),
});
