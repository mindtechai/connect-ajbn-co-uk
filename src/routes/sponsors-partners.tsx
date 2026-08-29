import { createFileRoute } from "@tanstack/react-router";
import SponsorsPartnersPage from "@/pages/SponsorsPartners";

const BASE = "https://connect.ajbn.co.uk";
const TITLE = "Sponsors & Partners | AJBN Connect";
const DESCRIPTION =
  "Meet the sponsors and partners behind AJBN's corporate event management and exhibitions, and explore sponsorship tiers for high-profile London business networking events.";

export const Route = createFileRoute("/sponsors-partners")({
  component: SponsorsPartnersPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${BASE}/sponsors-partners` },
    ],
    links: [{ rel: "canonical", href: `${BASE}/sponsors-partners` }],
  }),
});
