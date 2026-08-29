import { createFileRoute } from "@tanstack/react-router";
import LionsPage from "@/pages/Lions";

const BASE = "https://connect.ajbn.co.uk";
const TITLE = "AJBN Impact Lions Club | Charitable Arm of AJBN";
const DESCRIPTION =
  "The AJBN Impact Lions Club is the charitable arm of the Asian Jewish Business Network — fundraising, ESG impact and cross-communal business networking through high-profile London events.";

export const Route = createFileRoute("/lions/")({
  component: LionsPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${BASE}/lions` },
    ],
    links: [{ rel: "canonical", href: `${BASE}/lions` }],
  }),
});
