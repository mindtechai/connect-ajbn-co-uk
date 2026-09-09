# Fix: Directory shows 0 listings

## What I checked

- The 135 companies are definitely in the database (`corporate_members`: 135 rows, all marked verified).
- So the import worked — the problem is purely permissions.

Two things block them, both confirmed:

1. **No access rights were granted on the new company list.** The list has viewing rules, but the app's signed-in role was never given permission to read the table at all, so every request fails before the rules are even considered. This alone returns zero rows for everyone.
2. **No account currently counts as an approved member.** All four existing accounts (including yours and the reviewer/test one) are still marked "prospective member". The directory rule only admits AJBN members, Impact Lions or super admins — so even with rights granted, an approved-member account is needed to see anything.

Note: there are no `is_active` or `membership_status` fields on this list — the only status field is `verified`, and all 135 rows are already true. Nothing to backfill there.

## The fix

1. Grant the signed-in app role read access to the company list (and full access to the internal service role). This is the missing piece from the original import.
2. Keep the viewing rule as "approved members only" — the directory is member-only by design — but promote the real accounts that should have access to AJBN member status, so they can actually see it. I'll promote `salil@proactiveconsultancy.co.uk` and `zeus@ajbn.co.uk`; tell me if any other of the four accounts should also be approved (`ae1043969@gmail.com`, `natanellider@gmail.com`).
3. Reload the directory signed in as an approved account and confirm it reads "Showing 135 of 135 listings", with search and the industry filter working.

I will not loosen the rule to "any signed-in user" — that would expose the member list to unapproved sign-ups. If you'd rather it be visible to every signed-in account regardless of approval, say so and I'll do that instead.

## Technical notes

- Migration: `GRANT SELECT ON public.corporate_members TO authenticated; GRANT ALL ON public.corporate_members TO service_role;`
- Same migration: insert `ajbn_member` rows into `public.user_roles` for the two named accounts (`ON CONFLICT DO NOTHING`); existing `prospective_member` rows left in place.
- No change needed to `src/pages/Directory.tsx` — the query and `verified` handling are already correct.
- The `is_approved_member` / `member_directory_list()` path stays as-is.
