import { createFileRoute } from "@tanstack/react-router";
import PrivacyPage from "@/pages/Privacy";

const BASE = "https://connect.ajbn.co.uk";
const TITLE = "Privacy Policy & Data Protection | AJBN Connect";
const DESCRIPTION =
  "How AJBN Connect collects, uses and protects member data, including direct member messaging, event registrations and your data protection rights.";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { property: "og:url", content: `${BASE}/privacy` },
    ],
    links: [{ rel: "canonical", href: `${BASE}/privacy` }],
  }),
});
