import { createFileRoute } from "@tanstack/react-router";
import ServicesPage from "@/pages/Services";

const BASE = "https://connect.ajbn.co.uk";
const TITLE = "Added Value Services for Members | AJBN Connect";
const DESCRIPTION =
  "Concierge services for AJBN members: capital introductions, advisory, referral rewards and technology support, delivered by trusted specialists inside our professional business networking club.";

const ORG = { "@type": "Organization", name: "Asian Jewish Business Network", url: BASE } as const;

// Describes the four services actually listed on this page.
const servicesSchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "AJBN added value services",
  itemListElement: [
    {
      name: "AJBN Capital Connect — Capital & Deal Matching",
      serviceType: "Capital and deal matching",
      description:
        "Connecting vetted property developers with active private and institutional capital, including investors, capital providers, banks and bridging or property finance providers, through the AJBN Capital Connect desk.",
      url: `${BASE}/services#capital-deal-matching`,
    },
    {
      name: "Professional Advisory Connect",
      serviceType: "Professional advisory introductions",
      description:
        "Introductions to network-verified solicitors, accountants and IFAs who structure, secure and complete high-value transactions.",
      url: `${BASE}/services#professional-advisory-connect`,
    },
    {
      name: "Referral Incentives Marketplace",
      serviceType: "Referral programme",
      description:
        "Structured referral fees or commission splits for members who introduce clients, property developers or finance providers that lead to a completed deal.",
      url: `${BASE}/services#referral-incentives-marketplace`,
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
      { property: "og:url", content: `${BASE}/services` },
    ],
    links: [{ rel: "canonical", href: `${BASE}/services` }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(servicesSchema) },
      { type: "application/ld+json", children: JSON.stringify(breadcrumbSchema) },
    ],
  }),
});
