import { createFileRoute } from "@tanstack/react-router";
import LionsPage from "@/pages/Lions";

const BASE = "https://connect.ajbn.co.uk";
const ORG_ID = `${BASE}/#organization`;
const LIONS_ID = `${BASE}/lions#organization`;
const TITLE = "AJBN Impact Lions Club | Charitable Arm of AJBN";
const DESCRIPTION =
  "The AJBN Impact Lions Club is the charitable arm of the Asian Jewish Business Network — fundraising, ESG impact and cross-communal business networking through high-profile London events.";

// Page-level entity for the club, using only facts shown on this page.
const lionsSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": LIONS_ID,
  name: "AJBN Impact Lions Club",
  url: `${BASE}/lions`,
  parentOrganization: { "@id": ORG_ID },
  description:
    "A separate charitable division within the Asian Jewish Business Network. Members contribute £250 a year to fund community initiatives, ESG projects and event fundraising, and receive an annual ESG impact report.",
  knowsAbout: [
    "charitable fundraising",
    "ESG reporting for corporate members",
    "charity events including golf days and galas",
  ],
  memberOf: { "@id": ORG_ID },
  makesOffer: {
    "@type": "Offer",
    name: "AJBN Impact Lions Club membership",
    url: `${BASE}/lions`,
    price: "250",
    priceCurrency: "GBP",
    category: "Membership",
    eligibleCustomerType: "AJBN members",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "AJBN Connect", item: `${BASE}/` },
    { "@type": "ListItem", position: 2, name: "Impact Lions Club", item: `${BASE}/lions` },
  ],
};

export const Route = createFileRoute("/lions/")({
  component: LionsPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${BASE}/lions` },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: `${BASE}/lions` }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(lionsSchema) },
      { type: "application/ld+json", children: JSON.stringify(breadcrumbSchema) },
    ],
  }),
});
