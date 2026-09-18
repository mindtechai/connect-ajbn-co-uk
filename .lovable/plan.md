# Real Admin Portal — live approvals, member records, moderation

Replaces the "check the daily email" workflow with a live admin area. The daily summary email stays, but the portal becomes the source of truth.

## 1. Live dashboard (/admin)

Replace today's placeholder overview (its numbers and charts are hard-coded demo data) with real figures:

- Cards: Total members, Pending approval (with the newest pending name, e.g. "Nelesh Kavia — ATZ Finance Ltd"), Approved, Blocks, New sign-ups last 24h and last 7 days.
- Chart: sign-ups per day over the last 30 days.
- Activity feed: newest sign-ups, new Needs & Offers posts, new introduction requests, new enquiries, new reports — each with name, company and date, and a link to the right screen.

Pending count also shows as a badge on the Approvals and Members items in the admin sidebar, so a new sign-up is visible without opening email.

## 2. Pending list and the email link

- `/admin/members?filter=pending` opens the members list already filtered to people awaiting approval, with Name, Company, Email, Phone, Signed up, Company match (does their company match an existing corporate member record) and actions View / Approve / Reject.
- The daily summary email's "Review new members" button and the instant new-sign-up email's buttons point at that URL. Clicking while signed out shows sign-in and then lands on the filtered list.
- Approve keeps the existing behaviour (marks them approved, gives them the member role, sends the approval email instantly, removes them from pending). Reject keeps them as prospective. No auto-approval anywhere.

## 3. Member detail page (/admin/members/[id])

New admin-only page showing: name, contact details, company and industry, joined date, current level and role, approval history from the audit log, and the Needs & Offers they posted. Actions: Approve/Reject, change level, reset password, remove (existing soft delete). Reached from View in the list and from the email buttons.

## 4. Blocks screen (/admin/blocks)

Lists member-to-member blocks: who blocked whom, both companies, the date, and an Unblock action. Sidebar entry "Blocks". This is the visible moderation surface for Apple's user-content requirement, alongside the existing Reports screen.

## 5. Reviewer access (moderation-only)

`apple-review@ajbn.co.uk` gets a moderation-only admin view: they can open `/admin`, and see Reports and Blocks with working unblock/dismiss tools, plus counts. Member emails, phone numbers, approve/reject, level changes, password resets, bulk email and the audit log are hidden for that account. Everyone who isn't a super admin (or the reviewer) still gets sent to their dashboard, and the admin area stays out of the member menu.

## Technical notes

- New `src/lib/admin-dashboard.functions.ts` (server functions, super-admin asserted like `admin-members.functions.ts`) returning the counts, the 30-day sign-up series and the activity feed from `profiles`, `user_roles`, `board_posts`, `member_blocks`, `member_intro_requests`, `service_enquiries`, `member_reports`.
- `src/lib/admin-blocks.functions.ts` for the blocks list and unblock (delete from `member_blocks`), audited.
- New routes `src/routes/admin/blocks.tsx` and `src/routes/admin/members.$memberId.tsx`, both `noindex` and wrapped in the admin guard; `Admin.tsx` routes them like the existing panels.
- `MemberManagement.tsx` reads `?filter=pending` (and `?member=`) from the URL to preset its status filter; `AnalyticsOverview.tsx` switches to live data with loading and empty states.
- `RequireSuperAdmin.tsx` gains a moderation-only mode; new `useAdminScope()` (`full` | `moderation`) drives which sidebar items and columns render. The reviewer is matched by their account, and the server functions that expose contact details or mutate members keep asserting full super admin, so the restriction is enforced server-side too.
- Email links updated in `src/routes/api/public/cron/admin-digest.ts`, `src/lib/signup-notify.server.ts` and `src/lib/email-templates/admin-new-signup.tsx`.
- No schema change: approval stays `profiles.is_approved` plus the member role (there are no `membership_status` / `approval_status` columns, and none are needed). Existing RLS and grants untouched.

## Verification

Signed in as super admin: dashboard shows the real pending count with Nelesh Kavia listed, the pending link filters correctly, his detail page opens, approving him moves him to approved. Signed in as the reviewer: `/admin` opens with Reports and Blocks only, no contact details. Signed in as an ordinary member: `/admin` redirects to the dashboard.
