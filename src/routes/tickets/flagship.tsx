import { createFileRoute } from "@tanstack/react-router";
import BuyTicketsFlagshipPage from "@/pages/BuyTicketsFlagship";

const BASE = "https://connect.ajbn.co.uk";
const TITLE = "AJBN Flagship B2B Networking Exhibition, 19 Oct 2026 | London";
const DESCRIPTION =
  "Tickets and details for the AJBN Flagship B2B Networking Exhibition & Corporate Event on 19 October 2026 at London Marriott Hotel Regent's Park, 128 King Henry's Rd, London NW3 3BY.";

const flagshipEventSchema = {
  "@context": "https://schema.org",
  "@type": "BusinessEvent",
  name: "AJBN Flagship B2B Networking Exhibition & Corporate Event",
  description:
    "Corporate Networking Exhibition in London hosting founders, investors and corporate leaders for cross-communal business networking and B2B strategic partnerships.",
  startDate: "2026-10-19T18:00:00+01:00",
  endDate: "2026-10-19T22:00:00+01:00",
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  url: `${BASE}/tickets/flagship`,
  location: {
    "@type": "Place",
    name: "London Marriott Hotel Regent's Park",
    address: {
      "@type": "PostalAddress",
      streetAddress: "128 King Henry\u2019s Rd",
      addressLocality: "London",
      postalCode: "NW3 3BY",
      addressCountry: "GB",
    },
  },
  organizer: {
    "@type": "Organization",
    name: "Asian Jewish Business Network",
    url: BASE,
  },
};

export const Route = createFileRoute("/tickets/flagship")({
  component: BuyTicketsFlagshipPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { property: "og:url", content: `${BASE}/tickets/flagship` },
    ],
    links: [{ rel: "canonical", href: `${BASE}/tickets/flagship` }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(flagshipEventSchema) },
    ],
  }),
});
