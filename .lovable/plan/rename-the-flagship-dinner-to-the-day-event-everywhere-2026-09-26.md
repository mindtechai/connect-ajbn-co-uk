# Rename the flagship "dinner" to the day event everywhere

The "Annual Flagship Dinner – save the date" wording only exists in one place in code (the admin Communications recent-actions list), but the event's venue and description also appear in several member-facing spots. All changes are text-only; no layout changes, no iPhone project files.

## Changes

1. **Admin Communications — Recent bulk actions** (`src/components/admin/BulkActionsPanel.tsx`, line 47)
   - Title becomes: "Annual Flagship Event – 19 Oct, London Marriott Swiss Cottage, 10AM-4PM Day Event – 50 stalls, 600 guests last year"

2. **Events table (database row)** — the admin Events screen reads from the database
   - Update the flagship event row (19 Oct 2026):
     - Title: "Annual Flagship Event"
     - Location: "London Marriott Swiss Cottage"
     - Description: "50 members paid for stalls erected by AJBN to showcase their business to attendees, 600 guests last year. Not evening dinner."
     - Time is already 10:00–16:00 London time — no change needed.

3. **Member-facing event pages** (same wording, so members and admin see one event)
   - `src/lib/publicEvents.ts` flagship entry: title, location ("London Marriott Swiss Cottage"), description updated; time label already "10:00 AM – 4:00 PM".
   - `src/pages/Events.tsx` flagship highlight card: venue line updated.
   - `src/pages/BuyTicketsFlagship.tsx`, `src/routes/tickets/flagship.tsx`, `src/components/landing/FlagshipEventSEOSection.tsx`: venue text changed from "London Marriott Hotel Regent's Park" to "London Marriott Swiss Cottage" (address 128 King Henry's Rd, NW3 3BY stays — that is the Swiss Cottage hotel's address).

## Verification

- Typecheck and build pass.
- Playwright check: Events page and admin Communications show the new title/venue; no "Dinner" wording remains.
- Publish to connect.ajbn.co.uk.
