import { createFileRoute } from "@tanstack/react-router";
import AccountDeletionPage from "@/pages/AccountDeletion";

const BASE = "https://connect.ajbn.co.uk";
const TITLE = "Request Account Deletion | AJBN Connect";
const DESCRIPTION =
  "Request permanent deletion of your AJBN Connect account and all associated data. Requests are confirmed by email and processed within 30 days.";

export const Route = createFileRoute("/account-deletion")({
  component: AccountDeletionPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { property: "og:url", content: `${BASE}/account-deletion` },
    ],
    links: [{ rel: "canonical", href: `${BASE}/account-deletion` }],
  }),
});
