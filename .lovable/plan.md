# Fix admin header logo link

## Goal
Make the top-left AJBN logo and "AJBN Admin / AJBN Reviewer" text in the admin layout header tappable, routing to `/admin` on admin pages and `/dashboard` on non-admin pages.

## What will change

1. **src/pages/Admin.tsx**
   - Wrap the logo `<img>` and the scope label text (`AJBN Admin` / `AJBN Reviewer`) together in a single `<Link>`.
   - Target: `/admin` when `location.pathname.startsWith('/admin')`, otherwise `/dashboard`.
   - Add `cursor-pointer` and ensure the hit area is large enough for mobile taps.
   - Keep the existing header layout, icons (shield, bell, settings, logout), counts and styling unchanged.

## Verification

- `bunx tsgo --noEmit`
- `git diff --check`
- `bun run build`
- Playwright: sign in as `salil@proactiveconsultancy.co.uk`, open `/admin/members?filter=pending`, click the top-left logo/text, confirm navigation lands on `/admin`.
- Publish to `https://connect.ajbn.co.uk`.

## Out of scope

- No iOS/Build 8 changes.
- No schema, RLS, auth, or email changes.
