import { createFileRoute } from "@tanstack/react-router";
import LoginPage from "@/pages/Login";

const BASE = "https://connect.ajbn.co.uk";
const TITLE = "Register or Sign In | AJBN Connect Member Portal";
const DESCRIPTION =
  "Register a fresh account or sign in to the new AJBN Connect portal to access the member directory, direct messaging and event registrations.";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { property: "og:url", content: `${BASE}/login` },
    ],
    links: [{ rel: "canonical", href: `${BASE}/login` }],
  }),
});
