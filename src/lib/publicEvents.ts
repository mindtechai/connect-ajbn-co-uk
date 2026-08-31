/**
 * Shared, browser-safe public event data.
 *
 * This is the single source of truth for the publicly visible AJBN event
 * listing: the landing-page events section, the crawlable /events page and
 * the Event JSON-LD all read from here so the structured data always
 * matches the visible content.
 */
import prideviewLogo from "@/assets/prideview-group.jpg.asset.json";
import lubbockFineLogo from "@/assets/lubbock-fine.png.asset.json";

export type EventItem = {
  id: string;
  kind: "networking" | "fundraising" | "coming_soon";
  title: string;
  subtitle?: string;
  date: string; // ISO
  endDate?: string; // ISO, only where the finish time is publicly stated
  priceGBP?: string; // numeric ticket price, only where publicly stated
  dateLabel?: string;
  timeLabel: string;
  location: string;
  description: string;
  price?: string;
  ctaLabel: string;
  ctaHref: string;
  highlights?: string[];
  isPlaceholder?: boolean;
  hostName?: string;
  hostWebsiteLabel?: string;
  hostWebsiteUrl?: string;
  hostLogoUrl?: string;
};

export const EVENTS: EventItem[] = [
  {
    id: "members-evening-2026-07-09",
    kind: "networking",
    title: "AJBN Members' Evening",
    date: "2026-07-09T17:00:00Z",
    endDate: "2026-07-09T20:00:00Z",
    timeLabel: "6:00 PM – 9:00 PM",
    location: "Vyman House, 104 College Rd, Harrow, HA1 1BQ",
    description:
      "6:00 PM – 9:00 PM | Vyman House, 104 College Rd, Harrow, HA1 1BQ. Hosted by Vyman Solicitors on their fabulous terrace. Join us for an enjoyable evening of networking, drinks, and delicious food, all in the company of fellow AJBN members.",
    ctaLabel: "Register your interest",
    ctaHref: "mailto:russell@ajbn.co.uk?subject=AJBN%20Members%27%20Evening%20Registration%20of%20Interest",
    highlights: [
      "Networking with fellow AJBN members",
      "Drinks & delicious food",
      "Hosted by Vyman Solicitors",
    ],
  },
  {
    id: "flagship-2026-10-19",
    kind: "networking",
    title: "AJBN Flagship Networking Day",
    date: "2026-10-19T09:00:00Z",
    endDate: "2026-10-19T15:00:00Z",
    timeLabel: "10:00 AM – 4:00 PM",
    location: "London Marriott Hotel, 128 King Henry's Rd, London NW3 3BY",
    description:
      "The UK's only platform dedicated to fostering commercial ties between the Asian and Jewish business communities. Senior leaders across Finance, Property, Banking, Law, Technology and Business Services meet for collaboration and knowledge exchange.",
    price: "£60 + VAT",
    priceGBP: "60",
    ctaLabel: "Buy tickets",
    ctaHref: "/tickets/flagship",
    highlights: [
      "50+ high-value exhibitors",
      "Hundreds of senior professionals",
      "Unmatched networking opportunities",
      "Sponsorship, stands & brand exposure available",
    ],
  },
  {
    id: "autumn-showcase-2026-09",
    kind: "networking",
    title: "AJBN Members Event Hosted by Prideview Group",
    subtitle: "Bimonthly Members-Only Meetup",
    date: "2026-09-18T18:00:00Z",
    dateLabel: "September 2026",
    timeLabel: "To Be Announced",
    location: "London - Venue TBA",
    description:
      "An exclusive, high-value networking and capital connection evening for registered members. Full details, venue, and guest speaker reveal coming soon.",
    ctaLabel: "Register your interest",
    ctaHref: "#",
    isPlaceholder: true,
    highlights: ["High-Value Peer-to-Peer Engagement"],
    hostName: "Hosted by Prideview Group",
    hostWebsiteLabel: "www.prideviewgroup.com",
    hostWebsiteUrl: "https://www.prideviewgroup.com",
    hostLogoUrl: prideviewLogo.url,
  },
  {
    id: "winter-gala-2026-12",
    kind: "networking",
    title: "AJBN Members Event Hosted by Lubbock Fine",
    subtitle: "High-Value Peer-to-Peer Engagement",
    date: "2026-12-10T18:00:00Z",
    dateLabel: "December 2026",
    timeLabel: "To Be Announced / Coming Soon",
    location: "London - Venue TBA",
    description:
      "Our final bimonthly meetup of the year, bringing together members for targeted peer-to-peer engagement and deal-structuring before the festive break. Full details TBA shortly.",
    ctaLabel: "Register your interest",
    ctaHref: "#",
    isPlaceholder: true,
    highlights: ["Bimonthly Members-Only Meetup"],
    hostName: "Hosted by Lubbock Fine",
    hostWebsiteLabel: "www.lubbockfine.co.uk",
    hostWebsiteUrl: "https://www.lubbockfine.co.uk",
    hostLogoUrl: lubbockFineLogo.url,
  },
];

/** Events sorted oldest-first by start date. */
export const eventsByDate = (list: EventItem[] = EVENTS) =>
  [...list].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

/**
 * Splits the public listing into upcoming and past so crawlers (and readers)
 * can tell current opportunities from historical events. `now` is passed in
 * by callers so server and client renders agree.
 */
export function splitEvents(now: number, list: EventItem[] = EVENTS) {
  const sorted = eventsByDate(list);
  return {
    upcoming: sorted.filter((e) => new Date(e.date).getTime() >= now),
    past: sorted.filter((e) => new Date(e.date).getTime() < now).reverse(),
  };
}
