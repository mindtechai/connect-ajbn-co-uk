# Exhibitors section on /tickets/flagship

## What we're building

On the public ticket page **/tickets/flagship — AJBN Flagship Networking Day**, add a new "Exhibitors" section **below the £60 + ticket buttons block** (end of the ticket card). Note: this page currently has no venue map, so the section simply becomes the last block on the page.

Section heading: **"Exhibitors — {count} Confirmed (50+ Expected)"**, where {count} is computed live from the database (currently 28, matching the requested "28 Confirmed").

- Data: query `flagship_exhibitors` joined with `corporate_members` via the existing public pattern from `/events/flagship` (`.select("sort_order, corporate_members!inner(...)").order("sort_order", ascending)`), filtering to `verified` companies so the already-fixed visibility rules apply (hidden/unapproved companies never appear).
- Fields shown per card: company name, primary sector, city, and website as an external link with an external-link icon. Logos live in a private bucket and every `logo_filename` is currently null, so cards use the same initials tile as the sponsors/exhibitor grids; if a `logo_filename` is set later, we render it instead of initials using the existing logo-serving approach.
- Cards: responsive uniform grid in the same visual style as the sponsor tiles (`grid-cols-2 md:grid-cols-4`, bordered rounded cards, hover state) — no clutter, consistent with the page.
- Special case: "Fortitude Lions - London Fortitude Lions Club" links to https://www.fortitudelions.org — this is already its stored website value, so it will link there naturally; no hard-coding needed.
- Website hygiene: skip rendering the website link when it is missing or a placeholder like "#" (e.g. ONCO currently has "#").
- Empty state: if no exhibitors are returned, show "Exhibitors to be announced".

## Files changed

- `src/pages/BuyTicketsFlagship.tsx` — fetch exhibitors (same Supabase client query pattern as `src/routes/events.flagship.tsx`), render the new section with a small loading spinner. No changes to the ticket CTA, sponsors, header, or SEO metadata.

## Constraints respected

- No new libraries; iOS project files, auth, Report/Block and offline memberships untouched.
- No invented people or businesses — only admin-ticked exhibitors from the database appear.

## After build

- Typecheck, verify the section renders with all 28 exhibitors at desktop and phone widths via Playwright, confirm the Fortitude Lions link URL, then publish to https://connect.ajbn.co.uk.
