import { createFileRoute } from "@tanstack/react-router";
import RegisterPage from "@/pages/Register";

const BASE = "https://connect.ajbn.co.uk";
const TITLE = "Apply for AJBN Membership | Join the Network";
const DESCRIPTION =
  "Apply to join the Asian Jewish Business Network — cross-communal business networking, B2B strategic partnerships in London and access to our high-profile member events.";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { property: "og:url", content: `${BASE}/register` },
    ],
    links: [{ rel: "canonical", href: `${BASE}/register` }],
  }),
});
