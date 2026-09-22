# Directory service tags: checked, nothing to backfill

## What the live data shows

I checked before changing anything. The company listings are **not** empty:

- 111 business listings, **all 111** have a main service and a service list. Zero untagged.
- The Directory's service filter and the AI Matcher both read those business listings, so they already return real results (Tax Accounting returns 10, including BKL, Gravita and Proactive Consultancy).
- The only people records without services are 7 non-business accounts: Apple Review, Google Reviewer, Demo Connect, Laura Bahar, Saal Pat TEST and two unnamed pending sign-ups. None of them has a business, so there is nothing to copy onto them.

So the "90% of firms are NULL" diagnosis does not match the live data, and a services/bio backfill would have nothing to write. No database change is proposed.

## The one real gap

20 listings have no description. You asked for the list rather than any wording written for you, so nothing will be invented:

Alexander Lawson Chartered Surveyors, Asistu, Berenblut IT Training and Consultancy, Brinson Staniland Partnership, Dooa Capital, Edwin Coe LLP, Energy360 Ltd, Finawis, Foreign Currency Partners, IntSol Recruitment, LeeB Productions, London Fortitude Lions Club, Nishma Exley-Shah, ProfessionalAsian, Riddlebox UK Limited, SA Law, Sedulo, SJC Bookkeeping Ltd, St. James's Place Wealth Management, Teybridge Capital.

These still appear in the Directory and in Matcher results with their name, service tags and tier — only the short description is missing.

## What this plan does

1. Nothing is changed in the database and no code is edited.
2. You send me a line of description for any of the 20 names above, and I add exactly your wording to those listings.
3. If you'd rather I confirm it visually first, I sign in as your admin account and capture the Directory with a couple of service filters applied plus a live Tax Accounting match, so you can see the current state before deciding.

## Technical notes

- Verified with counts on `corporate_members` (111 rows, 0 with empty `services_list`, 0 with null `primary_sector`, 20 with empty `short_bio`) and on `profiles` (7 untagged, all non-business accounts).
- `service_taxonomy` holds 40 active services; the GIN index on `services_list` exists; `member_directory_list()` returns `primary_sector`, `services_list` and `company_id`.
- Untouched: `handle_new_user`, referral codes, membership tiers, approval logic, the company-visibility rule, and everything under `ios-ajbn/` (Build 8 locked).
