# Fix admin alerts for new sign-ups

Nelesh Kavia (ATZ Finance Ltd, nelesh@atzfinance.com) registered on 17 September and is still not approved — confirmed in the database. Today only a once-a-day summary goes out, and its buttons point at the wrong place.

## 1. Daily summary email links

Every button in the summary currently opens `https://connect.ajbn.co.uk/admin/members`, which is the full member list, and a signed-out click lands on the ordinary member sign-in page with no memory of where you were going.

- The "Review new members" button will open the pending-approvals screen (`/admin/approvals`) — the screen that lists exactly the people waiting for approval.
- The other buttons keep pointing at their own screens (enquiries, introductions, reports, Impact Lions, profile changes) instead of all going to one place.
- If you are signed out when you click, you are taken to sign in and then sent straight on to the screen from the email. This works for both email/password and Google sign-in.

Note: the app has one sign-in page for everyone; there is no separate admin sign-in address. The redirect makes the experience the same as the one requested — sign in once, land on the pending list.

## 2. Instant email when someone registers

As soon as a registration completes, two emails go out:

- **To admin@ajbn.co.uk** — subject "New AJBN member: Nelesh Kavia - ATZ Finance Ltd - needs approval" (name and business filled in per sign-up). Body shows name, business, email, phone (when given) and the date, plus two buttons: open that member's record, and open the pending-approvals list.
- **To the new member** — "Thanks for registering with AJBN Connect. Your membership is pending approval; you will get full access to the Directory and 1-2-1 messaging once approved."

Safeguards: each sign-up can only trigger one admin alert and one member confirmation (repeat attempts are ignored), and the existing daily summary stays as it is, so nothing is lost if an instant email cannot be delivered.

## 3. Email setup

Emails already send from your own verified sender domain through Lovable's built-in email service, with delivery history visible under Cloud → Emails. That service is already configured and working (it sends the daily summary, welcome and report emails today), so no separate email key is needed and no extra setting has to be added. Admin alerts go to admin@ajbn.co.uk as requested.

## Technical notes

- `src/routes/api/public/cron/admin-digest.ts`: replace the single `ADMIN_URL` with per-section URLs (`/admin/approvals` for new sign-ups and profile changes, `/admin/enquiries`, `/admin/intros`, `/admin/lions`, `/admin/members` for deletions).
- Sign-in redirect: `src/pages/Login.tsx` already honours `?next=`; `RequireSuperAdmin` will pass the attempted path as `?next=<path>` when redirecting to `/login`, and `/login` will accept `redirect=` as an alias for `next=` so the emailed form of the link also works. Only same-origin paths are accepted.
- New templates in `src/lib/email-templates/`: `admin-new-signup.tsx` (dynamic subject from member name + company) and `registration-pending.tsx`; both registered in `registry.ts`.
- New server function `src/lib/signup-notify.functions.ts` + `.server.ts`, called from `Register.tsx` after a successful `signUp` and from the Google sign-in path for first-time profiles. It loads the profile with the service-role client, sends both emails via `sendAppEmail` with idempotency keys (`signup-admin-<id>`, `signup-pending-<id>`), and returns silently if already sent or the profile is older than 24 hours. Member record button links to `/admin/members` with the member's id in the query so the admin list can open that row.
- No new tables, no new libraries, no schema changes; existing access rules untouched.
- Verify with `bunx tsgo --noEmit`, the build log, and a live check that the emailed link sends a signed-out visitor to sign-in and then to the pending list.
