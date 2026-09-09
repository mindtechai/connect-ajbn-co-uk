# Fix directory access and promote approved members

## What I checked

- `corporate_members` has 135 rows, all `verified=true`.
- The directory query currently fails because the `authenticated` role has no read privilege on `corporate_members`.
- All existing accounts are currently `prospective_member`, so none pass the `is_approved_member()` directory gate even after the grant.

## The fix

1. Grant signed-in app users read access to the company list, and full access to the service role.
2. Promote `salil@proactiveconsultancy.co.uk` and `zeus@ajbn.co.uk` to `ajbn_member` so they can view the directory.
3. Leave the member-only directory rule unchanged — the directory stays visible only to approved members.

## Technical notes

- Migration SQL: `GRANT SELECT ON public.corporate_members TO authenticated; GRANT ALL ON public.corporate_members TO service_role;`
- Same migration: insert `ajbn_member` rows into `public.user_roles` for the two named accounts with `ON CONFLICT DO NOTHING`.
- No code changes needed; the existing `Directory.tsx` query is already correct.
- The other two accounts (`ae1043969@gmail.com`, `natanellider@gmail.com`) remain prospective unless you say otherwise.