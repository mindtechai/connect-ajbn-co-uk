# New members directory, tidy service filter, better AI matcher

## What I checked first

- The uploaded PDF holds one row per business: business name and a free-text "Service / Category" only — no bios, websites, cities or LinkedIn.
- The app currently holds 135 company listings, all with a short bio, and none of them claimed by a member account yet.
- The current categories confirm the problems you listed: "Fiancial Services", "Financiel Services", "Briding Finance", "Energy Brockers", plus Accountants / Chartered Accountants / Chartered Accountants & Tax Advisers / Charterted Accountants all meaning the same thing.
- Deloitte is not in the uploaded list, so it will not appear. BKL, Gravita, Nyman Libson Paul, Lubbock Fine, Sobell Rhodes, Laurence Grant, SJC Bookkeeping and Eureka Capital Allowances are all there and will all carry a Tax Accounting tag.

## 1. The uploaded list becomes the master list

- Every business in the uploaded PDF is loaded in, with its service text cleaned up.
- Businesses in the app that are not in the uploaded list are removed from the directory.
- Where a name matches an existing listing, its bio, website, LinkedIn, city and tier are kept.
- Businesses new to the list start with name plus service tags only, until Russell sends fuller details.

## 2. Tidy service names

A single approved list of service names is stored in the database — your 25, plus these so nothing is left uncategorised:

Asset Finance, Immigration Legal Services, Solicitors, Business Consultancy, Human Resources, IT & Training, Cyber Security, Design & Print, Leisure & Hospitality, Health & Wellbeing, Care Services, Charity & Community, Actuarial Services, Engineering.

Each business gets one **primary service** plus a **list of services** it also covers, so a tax firm is findable under both Tax Accounting and Chartered Accountants. Typos are corrected on the way in. Any business whose original text doesn't map cleanly is tagged "Other / Business Services" and listed for you to correct.

## 3. Directory filter

- The text search box stays exactly as it is.
- A new searchable, multi-select "Filter by Service" dropdown, built from the approved list only — so no typos appear in it.
- Choosing "Tax Accounting" shows every firm tagged with it (BKL, Gravita, Nyman Libson Paul, Lubbock Fine, Sobell Rhodes, Laurence Grant, SJC Bookkeeping, Eureka Capital Allowances).
- A count badge shows "8 matches", and the service can be pre-set from a link.

## 4. AI Business Needs Matcher

- Required dropdown "What do you need?" (searchable, from the approved list), plus an optional "Tell us more (optional)" box for context like "for a property business in London".
- Find Matches is enabled as soon as a service is chosen — the old 20-character rule goes.
- Matching is now exact first: every business and member tagged with that service is collected, then the AI ranks the best 6 using their real profile text. Reasons quote the actual profile; "sounds like" and "potentially" wording is removed.
- Both company listings and signed-in member profiles are searched, so tax queries return the big firms rather than just ATZ Finance.
- "AI Matcher (Beta)" badge added, the existing disclaimer and report buttons stay, and a "View all in Directory" link opens the directory pre-filtered to the same service.

## 5. Cleaned spreadsheet

A file `AJBN_Master_Members_Cleaned.csv` is produced in your Files with columns: Business Name, Original Service, Normalized Primary Sector, Services List, Contact, Notes — ready to paste into a Google Sheet Russell can maintain.

## Technical notes

- Migration: new `public.service_taxonomy` table (name, sort order, active) with GRANT SELECT to `authenticated`/`anon`, service_role full, RLS on, writes restricted to super_admin; new `primary_sector text` and `services_list text[]` columns on `corporate_members` plus a GIN index on `services_list`; matching columns added to `profiles` so member records can carry the same tags. No change to `handle_new_user`, referral codes, membership tiers, approval logic, or the existing company-visibility rule that hides pending members' companies.
- Data load via `run_sql`: upsert the parsed PDF rows by normalised company name, set primary_sector/services_list, delete listings absent from the uploaded list.
- `src/pages/Directory.tsx`: keep the text search, replace the free-text industry select with a multi-select service filter driven by `service_taxonomy`, add the match count badge and read an initial `?service=` param.
- `src/lib/ai-matcher.functions.ts`: input becomes `{ service: string; context?: string }`; deterministic shortlist from `corporate_members.services_list` plus `member_directory_list()`, AI limited to ranking, `slice(0, 6)`, prompt rewritten to forbid speculative wording; rate limit and `ai_matcher_requests` logging unchanged.
- `src/pages/AiMatcher.tsx`: dropdown + optional textarea, enabled button, Beta badge, "View all in Directory" link.
- iOS/`ios` and Build 8 files untouched. Verify with `bunx tsgo --noEmit`, the build log, row counts, and a Playwright pass at 1280x1800 with a minted session for an approved account.
