# Fix: directory shows "0 of 0" for the demo account

## What I confirmed

- The 135 companies are in the database and all marked verified — the data is fine.
- `demo@ajbn.co.uk` exists and is confirmed, but its only membership level is **prospective member**. The directory is deliberately restricted to approved members, so every listing is filtered out and the page reads "Showing 0 of 0".
- The fields named in your notes (`is_active`, `show_in_directory`, `membership_status`, `is_corporate_member`) do not exist in this app. The equivalent controls here are membership level (prospective / AJBN member / Impact Lion / super admin) and the `verified` flag on company listings. So the SQL in the file can't be run as written — I'll use the app's real fields instead.
- `Russell@ajbn.co.uk` and `Salil@ajbn.co.uk` have no accounts. The accounts that exist are demo, apple-review, salil@proactiveconsultancy.co.uk, zeus, and two Gmail sign-ups.
- The iOS meta tag flagged is present and deprecated as described.

## The fix

1. Promote `demo@ajbn.co.uk` to AJBN member so it passes the directory gate. This alone makes the directory show all 138 listings for the reviewer account.
2. Make the empty state honest instead of silent: if a signed-in account isn't yet an approved member, show a teaser panel — "Live from the AJBN member directory. Full profiles available to active members after sign-in." with three blurred placeholder tiles — rather than "0 of 0 / No members match your filters". Genuine "no search results" keeps its own message.
3. Confirm the industry filter default: "All industries" already shows everything; I'll verify it against the real data rather than change the logic.
4. Update the iOS home-screen tags: add `mobile-web-app-capable`, set the status bar style to `black-translucent`, keep the Apple tag alongside it for older iOS.
5. Verify as `demo@ajbn.co.uk`: load home, events, directory, profile, services and messages, capture the directory count, and report any console errors.

Nothing else about who can see the directory changes — it stays approved-members-only.

## Technical notes

- Migration: insert `ajbn_member` into `public.user_roles` for the demo user id with `ON CONFLICT DO NOTHING`; leave the prospective row in place (matches how apple-review was handled).
- `src/pages/Directory.tsx`: split the zero-result branch into "not an approved member" (teaser, blurred tiles, no count line) vs "no search matches" (current copy). Approved-member detection from the roles already exposed by `useAuth`; the RPC/table queries stay unchanged.
- `src/routes/__root.tsx` head meta: add `mobile-web-app-capable`, change `apple-mobile-web-app-status-bar-style` to `black-translucent`.
- No schema columns added; no change to `corporate_members`, RLS policies, or `member_directory_list()`.
- Verification via a local Playwright pass on the six routes with a demo session, checking the console.
