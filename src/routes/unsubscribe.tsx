import { createFileRoute } from "@tanstack/react-router";
import UnsubscribePage from "@/pages/Unsubscribe";

export const Route = createFileRoute("/unsubscribe")({
  // Utility route: kept out of search and AI crawler indexes.
  head: () => ({
    meta: [
      { title: "Unsubscribe | AJBN Connect" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: UnsubscribePage,
});
