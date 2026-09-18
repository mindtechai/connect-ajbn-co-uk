import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import NeedsOffersPage from "@/pages/NeedsOffers";

export const Route = createFileRoute("/needs-offers")({
  // Member-only area: kept out of search and AI crawler indexes.
  head: () => ({
    meta: [
      { title: "All Needs & Offers | AJBN Connect" },
      {
        name: "description",
        content:
          "Browse every live need and offer posted by AJBN members, filter by type or category, and message the member directly.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <NeedsOffersPage />
    </RequireAuth>
  ),
});
