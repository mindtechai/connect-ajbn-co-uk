# Final Capital Connect safety sweep

## Verified state of live production (checked this turn)

Anonymous fetches of `/`, `/services`, `/referral-rewards`, `/events` (deployment `4f3b…4716`) return **0** occurrences of every prohibited phrase ("Capital & Deal Matching", "Bridging the gap", "Submit a Deal", "Deal Orchestrator", "targeted matching", "success fee", "commission split", "IFAs", "bridging companies", "capital deployment", "qualified deal", "Monetise your introductions") and contain the approved wording ("member identifies a business need", "contract independently", "does not provide financial advice", "Request an Introduction"). The old copy you saw was a cached page, not the live build.

## The one change to make

`src/components/landing/StatsSection.tsx` — the homepage stat strip currently reads:

```text
150+   Active Corporate Members
£10M+  Deals Facilitated Todate
50+    Events Todate
£87K   Raised for Charity
```

No factual source exists in the application for a £10M figure or for any substitute network metric, so per your instruction the card is removed rather than replaced. The "Todate" typo on the retained Events card is corrected. Result:

```text
150+   Active Corporate Members
50+    Events to Date
£87K   Raised for Charity
```

The grid changes from a 4-column to a 3-column layout on desktop (2 columns on mobile is unchanged). No other file references the £10M figure — it appears nowhere in schema, metadata, OpenAPI or MCP files.

## Explicitly unchanged

- Capital Connect copy, CTA ("Request an Introduction"), the operating model and the "AJBN does not provide financial advice…" boundary on `/services`, `/referral-rewards` and `/`.
- Member profile tag suggestions in `src/pages/Profile.tsx` — "IFA" and "Funder" stay.
- All schema (`Organization`, `WebSite`, `Person`, `Service`, `ItemList`, `BusinessEvent`); no financial-service schema, no FAQ/QAPage schema, no new SEO-only content.
- Supabase, RLS, migrations, auth, permissions, member directory, messaging, referral logic, events/RSVP, registration, Impact Lions, UI/theme tokens, favicon/branding, `sitemap.xml`, `robots.txt`, routing, packages, `public/openapi.json`, `public/.well-known/mcp.json`.

## AEO/GEO effect

Removing the "Deals Facilitated" claim eliminates the last surface an answer engine could read as AJBN arranging transactions. The multidisciplinary ecosystem positioning (legal, barristers, accounting, tax, architecture, surveying, capital allowances, property, construction, technology, marketing, business advisory, finance and other professional/commercial sectors) and the AJBN → AJBN Connect → Capital Connect → Membership Referral Programme → Impact Lions entity hierarchy are untouched.

## Build, publish, verify

1. Confirm the build is clean after the edit.
2. Publish the approved build.
3. Anonymous, cache-bypassing requests (`Cache-Control: no-cache` plus a unique query string) to `/`, `/services`, `/referral-rewards`, `/events`; capture `x-deployment-id` per page and confirm it is the new deployment, not `4f3b…4716`.
4. Grep the live HTML for the full prohibited-phrase list and report exact counts per page.
5. Grep the live HTML for the approved Capital Connect wording and report counts per page.
6. Confirm "Deals Facilitated" / "£10M" return 0 on the homepage.
7. Confirm a private route (e.g. `/dashboard`) still gates unauthenticated access and that `/directory` exposes no member data anonymously.
8. Report the actual live results and deployment ID — not the dashboard status.
