import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";

const BASE = "https://connect.ajbn.co.uk";
const ORG_ID = `${BASE}/#organization`;
const TITLE = "AJBN Connect | B2B Business Networking & Events, London";
const DESCRIPTION =
  "AJBN Connect: the digital hub for the Asian Jewish Business Network — a premier B2B networking organisation and professional corporate event management company in London.";

// Person entities for the leadership already publicly named and described in
// the About section of this page. No information beyond what is displayed.
const peopleSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${BASE}/#person-russell-bahar`,
      name: "Russell Bahar",
      jobTitle: "Founder & CEO, Director & Co-founder",
      worksFor: { "@id": ORG_ID },
      sameAs: "https://www.linkedin.com/in/russell-bahar-/",
    },
    {
      "@type": "Person",
      "@id": `${BASE}/#person-bianca-weber`,
      name: "Bianca Weber",
      jobTitle: "Director",
      worksFor: { "@id": ORG_ID },
      sameAs: "https://www.linkedin.com/in/bianca-weber-/",
    },
    {
      "@type": "Person",
      "@id": `${BASE}/#person-justin-cohen`,
      name: "Justin Cohen",
      jobTitle: "Co-founder",
      worksFor: { "@id": ORG_ID },
      sameAs: "https://www.linkedin.com/in/justin-cohen-mbe-79678b181/",
    },
    {
      "@type": "Person",
      "@id": `${BASE}/#person-salil-patankar`,
      name: "Salil Patankar",
      jobTitle:
        "Head of Capital Connect Ecosystems @AJBN · App Developer · Founder & Mentor, AJBN Impact Lions Club",
      worksFor: { "@id": ORG_ID },
      sameAs: "https://www.linkedin.com/in/salil-patankar-94892a367/",
    },
  ],
};

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${BASE}/` },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: `${BASE}/` }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(peopleSchema) },
    ],
  }),
});
