import { createFileRoute } from "@tanstack/react-router";
import ServicesPage from "@/pages/Services";

const BASE = "https://connect.ajbn.co.uk";
const TITLE = "Added Value Services for Members | AJBN Connect";
const DESCRIPTION =
  "Concierge services for AJBN members: capital introductions, advisory, referral rewards and technology support, delivered by trusted specialists inside our professional business networking club.";

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${BASE}/services` },
    ],
    links: [{ rel: "canonical", href: `${BASE}/services` }],
  }),
});
