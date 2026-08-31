import { createFileRoute } from "@tanstack/react-router";
import ServicesPage from "@/pages/Services";

const BASE = "https://connect.ajbn.co.uk";
const TITLE = "Member Services & Business Introductions | AJBN Connect";
const DESCRIPTION =
  "Services for AJBN members: business and professional introductions through Capital Connect, advisory connections, the membership referral programme and technology support inside our multidisciplinary B2B network.";

const ORG = {
  "@type": "Organization",
  "@id": `${BASE}/#organization`,
  name: "Asian Jewish Business Network",
  url: BASE,
} as const;

// Describes the four services actually listed on this page.
const servicesSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "AJBN added value services",
  itemListElement: [
    {
      name: "AJBN Capital Connect",
      serviceType: "Member networking and business introductions",
      description:
        "A member networking initiative connecting AJBN members with relevant business and professional connections across the wider AJBN network. Where a member identifies a business need, AJBN may identify a relevant professional or business connection and, at the member's request, facilitate an introduction. The parties communicate and contract independently. AJBN does not provide financial advice, recommend financial products or negotiate transactions.",
      url: `${BASE}/services#capital-connect`,
    },
    {
      name: "Professional Advisory Connect",
      serviceType: "Professional advisory introductions",
      description:
        "Introductions to professional advisers within the network, including solicitors, accountants, surveyors, architects and capital allowances specialists. Any engagement is agreed directly between the parties.",
      url: `${BASE}/services#professional-advisory-connect`,
    },
    {
      name: "Membership Referral Programme",
      serviceType: "Membership referral programme",
      description:
        "Members who introduce prospective businesses and professionals to AJBN membership may receive membership renewal credit or another membership referral benefit.",
      isRelatedTo: `${BASE}/referral-rewards`,
      url: `${BASE}/services#membership-referral-programme`,
    },
    {
      name: "Member-Exclusive Tech Builds",
      serviceType: "Web and application development",
      description:
        "Custom web apps, client portals and digital platforms for member businesses at member-only corporate rates.",
      url: `${BASE}/services#member-exclusive-tech-builds`,
    },

  ].map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Service",
      name: s.name,
      serviceType: s.serviceType,
      description: s.description,
      url: s.url,
      provider: ORG,
      areaServed: { "@type": "City", name: "London" },
      audience: { "@type": "BusinessAudience", name: "AJBN corporate members" },
    },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "AJBN Connect", item: `${BASE}/` },
    { "@type": "ListItem", position: 2, name: "Added Value Services", item: `${BASE}/services` },
  ],
};

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { property: "og:url", content: `${BASE}/services` },
    ],
    links: [{ rel: "canonical", href: `${BASE}/services` }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(servicesSchema) },
      { type: "application/ld+json", children: JSON.stringify(breadcrumbSchema) },
    ],
  }),
});
