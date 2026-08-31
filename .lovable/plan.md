# Reconcile Capital Connect positioning — findings first, then a small residual sweep

## What live production actually serves right now

Anonymous requests were made this turn to `/`, `/services`, `/referral-rewards` and `/events` on https://connect.ajbn.co.uk (all served by deployment `4f3b…4716`). The raw HTML was searched for the old terminology you listed.

Occurrence counts in the live HTML:

```text
Capital & Deal Matching                 0
Bridging the gap                        0
Submit a Deal                           0
Deal Orchestrator                       0
targeted matching                       0
success fee / commission split          0
IFAs                                    0
bridging companies                      0
capital deployment / seeking funds      0
Monetise your introductions             0
qualified deal                          0
```

Approved wording present in the live HTML:

```text
/services          "member identifies a business need" x4, "contract independently" x5,
                   "does not provide financial advice" x4, "Request an Introduction" x1
/referral-rewards  approved model wording x2-4
/                  approved model wording x1-3
/events            approved model wording x1-2
```

So the approved positioning is live. The page you inspected is almost certainly a cached copy — browser cache, an installed PWA service worker for this site (the app registers one), or an intermediate proxy. Recommended check before any code work: open `/services` in a private window or with a cache-busting query string (`/services?v=1`), or hard-reload; that will confirm the same result.

Because of this, the plan below is deliberately small: there is nothing to rewrite for the pages in question. It covers only genuine residual items found in the source.

## Residual items found in source (candidates for change)

1. `src/components/landing/StatsSection.tsx` — homepage stat reads "£10M+ Deals Facilitated Todate". "Deals Facilitated" implies AJBN arranges transactions, and "Todate" is a typo. Proposed replacement: "£10M+ Business Value Reported by Members" (wording to be confirmed by you — see Ambiguities).
2. `src/pages/Profile.tsx` — member tag suggestions include "IFA" and "Funder". These are member-authored sector self-descriptions, not AJBN services, so they are factually legitimate under your critical constraint. Proposed: leave unchanged (flagged for your decision only).

No other occurrences of the prohibited vocabulary exist anywhere in `src/` or `public/` — including `public/openapi.json` and `public/.well-known/mcp.json`, which already describe the API as a public directory and events feed with no financial framing.

## Per-area review outcome

- `/services` (`src/pages/Services.tsx`, `src/routes/services.tsx`, `src/components/services/*`): Capital Connect card already reads as a member networking / business-introduction initiative, the CTA is already "Request an Introduction", and the "How AJBN Capital Connect works" section already carries the approved paragraph verbatim, including the "does not provide financial advice" sentence. Professional Advisory Connect already frames AJBN as introducer, not adviser. Membership Referral Programme is already stated as membership referral, not transaction referral. No change required.
- `/referral-rewards` (`src/pages/ReferralRewards.tsx`, `src/routes/referral-rewards.tsx`): remuneration is expressed only as membership renewal credit and recognition tiers. No leads/mandates/ticket-size/success-fee/commission language remains. No change required.
- `/` (`src/pages/Index.tsx` and `src/components/landing/*`): Salil's Capital Connect role is already phrased as member networking and business introductions; his genuine professional background stays. Only the StatsSection line above needs attention.
- `/events` (`src/lib/publicEvents.ts`, `src/components/landing/EventsSection.tsx`, `src/components/events/PublicEventsView.tsx`, `src/routes/events.tsx`): event copy describes audience and hosts factually. No implication that AJBN arranges transactions. No change required.
- Schema and metadata (`src/routes/__root.tsx` Organization/WebSite, `src/routes/index.tsx` Person graph, `src/routes/services.tsx` Service ItemList, `src/routes/events.tsx` BusinessEvent ItemList, `src/routes/lions/index.tsx`): Capital Connect is already typed as "Member networking and business introductions". No new financial-service schema, no FAQ/QAPage schema will be added.

## AEO/GEO position (already encoded, verified in live HTML)

```text
Asian Jewish Business Network  -> multidisciplinary B2B business and professional network
AJBN Connect                   -> AJBN's digital member platform
Capital Connect                -> member networking and requested business/professional introductions
Membership Referral Programme  -> member referral and renewal benefits
AJBN Impact Lions Club         -> charitable initiative
```

The introduction mechanism (need identified → introduction requested → parties contract independently) and the sector list are both present in visible copy and in `Service.description`, which is what answer engines quote. If the StatsSection line changes, it becomes the only place a "deals" reading could be inferred, so fixing it strengthens the entity story without touching schema.

## Explicitly NOT changed

Supabase config, RLS, migrations, authentication, roles/permissions, member directory, messaging, events, RSVP, registration, Impact Lions functionality, referral logic, UI/theme tokens, favicon and branding assets, `public/sitemap.xml`, `public/robots.txt`, and the public/private route architecture. The change scope is one copy string (plus an optional second decision), frontend only.

## Production verification procedure (after any change is published)

1. Anonymous, cache-bypassing fetches of `/`, `/services`, `/referral-rewards`, `/events` with `Cache-Control: no-cache` and a unique query string, capturing `x-deployment-id` from response headers.
2. Repeat one fetch with a Googlebot user agent to confirm crawler parity.
3. Grep the decoded HTML for the full prohibited list ("Capital & Deal Matching", "Bridging the gap", "Submit a Deal", "Deal Orchestrator", "targeted matching", "success fee", "commission split", "IFAs", "bridging companies", "capital deployment", "Deals Facilitated", "qualified deal", "Monetise your introductions") and report exact counts per page.
4. Grep for required approved phrases and report counts per page.
5. Report the deployment ID and confirm every page returned the same one. Dashboard/build messages are not treated as evidence.

## Ambiguities needing your approval

1. Replacement text for the homepage stat currently reading "£10M+ Deals Facilitated Todate" — proposed "£10M+ Business Value Reported by Members". Confirm or supply preferred wording.
2. Keep or remove "IFA" and "Funder" from the member profile tag suggestions. My recommendation is keep (factual member sector self-description).
3. Confirm whether you still want a republish after this one-line change, given production already serves the approved positioning.
