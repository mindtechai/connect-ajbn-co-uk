# Bell in the top bar + "Notify All" on event cards

## What members will see
- A bell with a red unread count at the top right of every member page that has the "Dashboard" back link (Events, Directory, Messages, Settings, etc.). The Dashboard and Admin screens already have it, so nothing changes there.
- Tapping the bell opens the existing Notification Center. Tapping a notification marks it read and, if it's about an event, opens the Events page scrolled to that event. "Mark all read" stays.

## What super admins will see
- A small "Notify All" button with a bell at the top right of each event card on Upcoming events: the Annual Flagship Event card, the Coming Soon cards and every event listed from the database.
- Tapping it sends every approved member a bell notification about that event, e.g. "Annual Flagship Event – 19 Oct, London Marriott Swiss Cottage, 10AM–4PM", with a short body and a link to the event.
- If that event was already announced in the last 24 hours, a box asks "Already notified – send again?" with Confirm / Cancel.
- A message confirms how many members were notified.
- Members who turned off Announcements in their settings are skipped, as with the Communications panel.

## Not changed
Layout, Report/Block, Apple + Google sign-in, offline memberships, iPhone project files.

## Technical details
- Migration (adds columns only, nothing breaks): `notifications` gets nullable `link text` and `event_key text`, plus an index on (event_key, created_at). No policy changes, because inserts go through a server function.
- New `src/lib/event-notify.functions.ts`: `notifyEventAll({ eventKey, title, body, link, force })` with `requireSupabaseAuth`. It checks super_admin through `has_role` as the caller. If `force` is not set and a row with that event_key exists from the last 24h, it returns `{ alreadySent: true, sentAt }`. Otherwise it loads approved, non-deleted profiles, applies each member's announcements in-app setting, and bulk-inserts notifications using the admin client loaded inside the handler. It writes an `admin_audit_log` entry (`notify_event`) and returns the count.
- `NotificationsBell.tsx`: selects `link`; clicking an item marks it read and navigates to the link.
- `AppLayout.tsx`: shows `<NotificationsBell />` on the right when the user is signed in, before any `headerRight`.
- `Events.tsx`: new `NotifyAllButton` (super_admin only, via useAuth roles) placed absolutely at the top right of each card, with an AlertDialog for the resend check. Event cards get `id="event-<key>"` so the link `/events#event-<key>` scrolls to them.
- Check with tsgo and the build, then run Playwright as salil@ (send, then resend and see the prompt, then check the bell badge). Then publish.
