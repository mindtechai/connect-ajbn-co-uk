import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import EventsPage from "@/pages/Events";
import { PublicEventsView } from "@/components/events/PublicEventsView";
import { EVENTS } from "@/lib/publicEvents";

const BASE = "https://connect.ajbn.co.uk";
const TITLE = "AJBN Events | B2B Networking Events in London";
const DESCRIPTION =
  "Upcoming and past Asian Jewish Business Network (AJBN) events in London: bimonthly members' evenings hosted by member firms and the annual AJBN flagship B2B networking exhibition.";

// The flagship event keeps its own BusinessEvent schema on /tickets/flagship,
// so it is excluded here to avoid two competing descriptions of one event.
const eventListSchema = () => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "AJBN events programme",
  itemListElement: EVENTS.filter((e) => e.id !== "flagship-2026-10-19").map((e, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "BusinessEvent",
      name: e.title,
      description: e.description,
      startDate: e.date,
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      url: `${BASE}/events#${e.id}`,
      location: { "@type": "Place", name: e.location, address: e.location },
      organizer: { "@type": "Organization", name: "Asian Jewish Business Network", url: BASE },
      audience: { "@type": "BusinessAudience", name: "AJBN corporate members and invited guests" },
    },
  })),
});

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "AJBN Connect", item: `${BASE}/` },
    { "@type": "ListItem", position: 2, name: "Events", item: `${BASE}/events` },
  ],
};

function EventsRoute() {
  const { user } = useAuth();
  const [now] = useState(() => Date.now());

  if (!user) return <PublicEventsView now={now} />;

  return (
    <RequireAuth>
      <EventsPage />
    </RequireAuth>
  );
}

export const Route = createFileRoute("/events")({
  component: EventsRoute,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${BASE}/events` },
    ],
    links: [{ rel: "canonical", href: `${BASE}/events` }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(eventListSchema()) },
      { type: "application/ld+json", children: JSON.stringify(breadcrumbSchema) },
    ],
  }),
});
