# Permanently fix the admin redirect race

## Verified current state

- Salil’s account already has `super_admin` alongside its member roles.
- Signed-in users can already read their own role, and super admins can read all roles.
- There are still 11 member records and exactly 6 pending approvals, with names, companies, referral codes, and tiers intact.
- The admin guard already waits for the first role lookup, but a later sign-in/session transition can begin another lookup while the old “roles loaded” flag remains true. During that gap, stale or cleared roles can still trigger `/dashboard`.
- `/admin` already contains the combined counts, pending approvals, blocks, reports, and audit log.

## Changes

1. Make every authenticated identity transition start a fresh access check:
   - mark roles as not loaded before fetching;
   - clear roles that belong to a previous user;
   - associate each result with the user it was requested for so an older response cannot overwrite a newer session;
   - mark access loaded only after the current user’s lookup succeeds.
2. Keep the admin guard in its loading screen until the current user’s access check is complete. Redirect only after a definitive non-admin result.
3. Preserve the intended `/admin` or `/admin/members?filter=pending` destination through sign-in.
4. Log the resolved roles and lookup failures without exposing private session data.

## Database handling

No database migration or data write is planned because the requested role row and policies already exist live. Recreating them would not fix the race, and a self-referencing role policy can introduce recursion. Existing profile creation, referral, membership, approval, directory visibility, and company visibility rules remain untouched.

## Verification and release

- Sign in only as `salil@proactiveconsultancy.co.uk` using the managed test session.
- At 1280×1800, open `/admin` and `/admin/members?filter=pending` directly, including a fresh load and session restoration.
- Confirm `/admin` shows counts plus pending approvals, blocks, reports, and audit log.
- Confirm the pending screen shows all six expected people.
- Confirm the admin can see ATZ Finance while ordinary-member visibility rules remain unchanged.
- Run the project checks and inspect current preview errors.
- Do not touch iOS or Build 8 files.
- Publish to `https://connect.ajbn.co.uk` after verification passes.
