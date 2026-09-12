# Dashboard Quiet Hours additions

## What will change

- Add a dismissible education card near the top of `/dashboard`, before the existing messaging onboarding content.
  - Moon icon.
  - Title: “New: Respect Mode - Quiet Hours”.
  - Copy: “Fri 6pm-Sat 10pm: bells muted, messages emailed with respect note. Inspired by Shabbat rest - for focus & family time. Admin can set for you, or you can set in Settings.”
  - “Got it” button dismisses it permanently for that member/browser using local storage, so no database table is added.
- Add an amber dashboard banner whenever Quiet Hours applies:
  - The member’s stored Quiet Hours preference is enabled, or the current UK time is inside Friday 6pm–Saturday 10pm.
  - Text: “You are in Quiet Hours till Sat 10pm. Messages coming via email.”
  - Reuse the existing UK-time schedule logic and Quiet Hours state event so it updates without a page refresh.
- Update the existing Settings Quiet Hours switch label to: “Enable my Quiet Hours auto Fri 6pm-Sat 10pm”.
  - Continue saving to the existing `profiles.quiet_hours_enabled` field.
  - Keep the existing admin-controlled behavior, Shabbat explanation, status text, and notification suppression behavior unchanged.

## Technical notes

- Files expected: `src/pages/Dashboard.tsx`, `src/pages/AccountSettings.tsx`, and possibly `src/hooks/useQuietHours.ts` to expose the exact OR condition requested.
- No new tables, migrations, libraries, routes, email templates, or notification changes.
- Existing dashboard cards, Quiet Hours badge, Settings actions, RLS, and member/admin behavior remain intact.
- Verify with TypeScript/build checks and inspect the dashboard rendering logic for both in-window and out-of-window states.
