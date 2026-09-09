# Real member directory, no more placeholders

## What you get

- A proper list of your 135 corporate members stored in the app's database, imported from your file.
- The Member Directory shows those real companies, searchable by name and filterable by industry.
- The 110 invented people (fake names, stock photos, made-up bios) disappear everywhere.
- Block and Report keep working on real member accounts — and the "This demo profile cannot be blocked" message goes away, because there are no demo profiles left.

## Important distinction

Your file lists companies (company, industry, city, tier, job title, bio, website, LinkedIn, verified) — not individual people with logins. So:

- Company entries are shown as directory listings: name, industry, city, tier, bio, website/LinkedIn links, verified tick.
- Messaging, blocking and reporting stay tied to real signed-in member accounts (currently three), since you can only message or block a person, not a company row.
- The directory will show both: signed-in members first (with Message / Block / Report), then the corporate member listings.

## Steps

1. Create the `corporate_members` table with exactly the columns you listed, readable by signed-in members, editable only by admins.
2. Import all 135 rows from your uploaded file.
3. Rewrite the Directory page: one search box (company, industry, city, bio), an industry filter built from the real data, and a live count. Remove the generated demo people entirely.
4. Remove the leftover demo fallbacks that could show invented figures to reviewers on the dashboard (referral leaderboard, activity ticker) so real accounts see real data or a clear empty state.
5. Verify: count the imported rows, load the Directory signed in as a real account, confirm no fake names or stock photos remain, and confirm Report/Block still work on a real member.

## Technical notes

- Migration: `public.corporate_members` (uuid id, the ten listed columns, created_at/updated_at + update trigger), GRANT to `authenticated` and `service_role`, RLS on, SELECT policy gated by `public.is_approved_member(auth.uid())`, write policies limited to `super_admin`.
- Import via `run_sql` INSERTs generated from the CSV (industry/bio strings contain commas and quotes — parsed properly, not split naively).
- `src/pages/Directory.tsx`: delete `generateDemoMembers`, `baseMembers`, name/city/avatar seed arrays and the "fall back when empty" branch; keep the `member_directory_list()` RPC for real member accounts and add a `corporate_members` query for listings.
- `src/lib/moderation.ts` `isRealMemberId` guard stays as a safety net but no longer triggers in normal use.
- Demo fallbacks removed from `ReferralLeaderboard.tsx`, `LionsReferralLeaderboard.tsx`, `NetworkTicker.tsx`; `demoMessaging`/`demoDeals` left untouched unless you want those cleaned too.
- No `logo_filename` images exist yet (column is empty in the file); listings show an initial-letter tile until logos are supplied.
