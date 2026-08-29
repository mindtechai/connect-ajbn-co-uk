import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";

const BASE = "https://connect.ajbn.co.uk";
const TITLE = "AJBN Connect | B2B Business Networking & Events, London";
const DESCRIPTION =
  "AJBN Connect: the digital hub for the Asian Jewish Business Network — a premier B2B networking organisation and professional corporate event management company in London.";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${BASE}/` },
    ],
    links: [{ rel: "canonical", href: `${BASE}/` }],
  }),
});
