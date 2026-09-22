# Connect real member accounts to their businesses and services

## What the check found

- The 40 approved service names and all 108 business listings are already loaded and tagged, so the Directory's service filter and the AI Matcher already return real results. No seeding of services or companies is needed.
- The gap is people: of 11 accounts, only Nelesh Kavia is linked to his business (ATZ Finance) and carries service tags. Everyone else has no business link and no services, so they never appear in a filtered Directory view or in a match.
- Of the other accounts with a business name, none matches a listing in the September master list: Proactive Consultancy, AJBNetwork Ltd, The Cevero Group Ltd (plus the Apple, Google and Demo review accounts, which are not real businesses).

No invented people or invented businesses will be added.

## What will be done

1. **Link every real account to its business listing** where the names match (after the same name-tidying rule already used elsewhere), and copy that listing's main service and service list onto the person, so they show up under the same filters as their firm. Today that is Nelesh / ATZ Finance, and it will keep working automatically for future members.

2. **Create listings for the real member businesses that have none** — Proactive Consultancy, AJBNetwork Ltd, The Cevero Group Ltd — using only what the account already holds (business name, and the owner's own description of what they do). Each is created already claimed by that member, so it is visible and counted as 1 of 3 representatives.

3. **Tag those members and their new listings from their own words**, mapped onto the approved service names only:
   - Salil Patankar / Proactive Consultancy — from "Accountancy, Tax, Business Advisory, Web 3, AI, Web & App Dev": Tax Accounting (main), plus Business Consultancy and IT Services.
   - AJBNetwork Ltd and The Cevero Group Ltd — the accounts hold no description of their services, so they will be created untagged and listed back to you to confirm. Nothing will be guessed.

4. **Leave the three review/test accounts alone** (Apple Review, Google reviewer, Demo Connect) — they are not businesses and must not appear as members' firms.

5. **Directory behaviour stays exactly as it is** — people in the Members tab, businesses in the Companies tab.

## After the change

- Filtering the Directory by Tax Accounting will show Salil alongside the accountancy firms; Asset Finance will show Nelesh / ATZ as one merged card in the Matcher, as it does now.
- You will get a short list of the accounts still missing service information, so you can tell me what to tag them with.

## Technical notes

- Data-only work through `run_sql`: insert the three missing `corporate_members` rows with `owner_user_id` set, backfill `profiles.company_id` via `normalize_company_name` matching, and set `primary_sector` / `services_list` on the matched profiles from their listing.
- The existing rep-limit trigger and company-visibility policy apply unchanged; no schema migration.
- Untouched: `handle_new_user`, referral codes, membership tiers, approval logic, RLS policies, and everything under `ios-ajbn/` (Build 8 locked).
- Verify with row counts, `bunx tsgo --noEmit`, the build log, and a Playwright pass at 1280x1800 and 390px with a minted session for the admin account, checking a Tax Accounting filter and a Tax Accounting match.
