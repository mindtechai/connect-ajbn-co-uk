import { createFileRoute } from "@tanstack/react-router";
import EmailUnsubscribePage from "@/pages/EmailUnsubscribe";

export const Route = createFileRoute("/email-unsubscribe")({
  // Utility route: kept out of search and AI crawler indexes.
  head: () => ({
    meta: [
      { title: "Email preferences | AJBN Connect" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: EmailUnsubscribePage,
});
