# Flagship Event Page

A clean, single-column page for the Annual Flagship Event (19 Oct), kept calm and uncluttered.

## How it will look (phone)

```text
+----------------------------------+
| < Events                         |
|                                  |
|  ANNUAL FLAGSHIP EVENT           |
|  Sun 19 Oct  10:00-16:00         |
|  London Marriott Swiss Cottage   |
|                                  |
|  50+ high-value exhibitors ·     |
|  600 guests last year            |
|                                  |
|  [   Book your place  ->     ]   |  <- opens ajbn.co.uk/buy-tickets
|                                  |
|----------------------------------|
|  Our Sponsors                    |
|  [SCW Legal]   [Tradelend]       |  <- headline, larger tiles
|  [Ash Verma]   [Riddlebox]       |  <- food & beverages
|                                  |
|----------------------------------|
|  Exhibitors (12)                 |
|  +--------+  +--------+          |
|  | logo   |  | logo   |          |
|  | Name   |  | Name   |          |
|  | Sector |  | Sector |          |
|  +--------+  +--------+          |
|                                  |
|----------------------------------|
|  About the day (2-3 short lines) |
+----------------------------------+
```

- The 4 main sponsors are the ones already recorded: Spector Constant & Williams and Tradelend (headline, larger tiles), Ash Verma Consulting and Riddlebox (food & beverages). Their logos link to their websites.
- Exhibitor cards: logo, company name, main sector only. Tap a card for a short profile sheet (bio, services, "View in directory").
- Desktop: same layout, exhibitors in 4 columns, centred, lots of white space.
- If no exhibitors are picked yet: "Exhibitors announced soon" instead of the grid.
- Existing AJBN navy/teal styling; no extra banners or widgets.

## Linking
- Events calendar: the flagship event card gets a "View event page" button.
- Dashboard flagship card and bell notification open this page instead of the general Events list.

## Admin: choosing exhibitors
- In Admin > Companies, each company gets a "Flagship exhibitor" on/off toggle. Only approved, visible directory companies can be ticked. Nothing is invented.

## Technical details
- New route `/events/flagship` (public, own head() metadata).
- Sponsors reuse the existing FlagshipSponsors data (no new uploads).
- New table `flagship_exhibitors (company_id -> corporate_members, sort_order)` with GRANTs + RLS: public read joined to already-visible companies, super_admin write.
- Booking button: external link `https://www.ajbn.co.uk/buy-tickets/` (new tab).
- No new libraries; iOS files, Report/Block, auth untouched.
