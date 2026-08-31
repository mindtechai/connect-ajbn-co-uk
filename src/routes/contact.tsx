import { createFileRoute } from "@tanstack/react-router";
import ContactPage from "@/pages/Contact";

const BASE = "https://connect.ajbn.co.uk";
const TITLE = "Contact the AJBN Team | AJBN Connect";
const DESCRIPTION =
  "Contact the Asian Jewish Business Network. Members, prospects, sponsors and partners can reach the right AJBN lead for membership, events and B2B strategic partnerships in London.";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { property: "og:url", content: `${BASE}/contact` },
    ],
    links: [{ rel: "canonical", href: `${BASE}/contact` }],
  }),
});
