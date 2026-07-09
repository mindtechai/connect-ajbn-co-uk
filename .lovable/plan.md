Plan: Upcoming Q3/Q4 Event Placeholders

1. Scope
- Add two placeholder events to both the public landing page (EventsSection) and the authenticated members-only events page (/events).
- Do not create database rows; keep these as static placeholders until full details are confirmed.
- Provide clear visual "Coming Soon / TBA" treatment using gold branding tokens.

2. Placeholder event data

Event 1 — AJBN Members Only Autumn Showcase
- Category: "Bimonthly Members-Only Meetup"
- Subtitle: "High-Value Peer-to-Peer Engagement"
- Date block: "September 2026" / "TBA"
- Time status: "To Be Announced"
- Description: "An exclusive, high-value networking and capital connection evening for registered members. Full details, venue, and guest speaker reveal coming soon."
- Button: "Keep Me Updated" (disabled, tooltip: "Details releasing soon!")
- Styling: gold "Coming Soon" badge overlay.

Event 2 — AJBN Annual Winter Gala & Networking
- Category: "Bimonthly Members-Only Meetup"
- Subtitle: "High-Value Peer-to-Peer Engagement"
- Date block: "December 2026" / "TBA"
- Time status: "To Be Announced"
- Description: "Our premier end-of-year gathering celebrating our business community, property updates, and member achievements. Full venue details and registration opening shortly."
- Button: "Keep Me Updated" (disabled, tooltip: "Details releasing soon!")
- Styling: gold "Coming Soon" badge overlay.

3. Implementation details

`src/components/landing/EventsSection.tsx`
- Extend `EventItem` type to support:
  - `subtitle?: string`
  - `isPlaceholder?: boolean`
  - `dateLabel?: string` (for month/year display when exact ISO date is not available)
  - `kind: "networking" | "fundraising" | "coming_soon"`
- Append the two placeholder objects to the static `EVENTS` array with `isPlaceholder: true` and `kind: "coming_soon"`.
- Update the date block renderer:
  - For placeholders, show the month/year label and a "TBA" day number instead of `getUTCDate()`.
- Add a gold "Coming Soon" badge next to the existing category badge.
- Replace the active CTA for placeholders with a disabled `Button` wrapped in a `Tooltip` ("Details releasing soon!").
- Keep existing real events untouched and ensure the sort still works by using a far-future ISO date for placeholders.

`src/pages/Events.tsx`
- Add a `PLACEHOLDER_EVENTS` array with the same two events (id, title, description, date label, kind).
- Render the placeholders directly below the flagship highlight card, always visible regardless of the filter.
- Add a `Coming Soon` badge and a disabled `Button` with tooltip for each placeholder.
- Use a compact card style matching the rest of the page (rounded-2xl, border, shadow-sm, gold accents).

4. UX / accessibility
- Tooltips must wrap the disabled button so users understand why it is disabled.
- No new backend tables or migrations.
- No new page routes.
- Keep PWA/header unchanged.

5. Files to edit
- `src/components/landing/EventsSection.tsx`
- `src/pages/Events.tsx`

6. Verification
- Run a build/typecheck to ensure the new type and tooltip imports compile.
- Visually confirm the two placeholder cards appear in the landing events section and on /events, with the Coming Soon badge and disabled tooltip button.
- Confirm filter tabs and existing event registration flow remain functional.