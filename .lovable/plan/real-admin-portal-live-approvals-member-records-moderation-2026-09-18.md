# Real Admin Portal — live approvals, member records, moderation

Replaces the "check the daily email" workflow. The daily summary email stays, but the portal becomes the source of truth. Web only — nothing here touches the Build 8 (v1.0.3) submission.

Apple reviewer lens: when `apple-review@ajbn.co.uk` signs in, moderation must be obvious straight away — the Blocks and Reports screens with working unblock/dismiss actions, plus visible counts.


## 1. Live dashboard (/admin)

Replace today's placeholder overview (its numbers and charts are hard-coded demo data) with real figures:

- Cards: Total members, Pending approval (count plus the newest pending name, e.g. "Nelesh Kavia — ATZ Finance Ltd"), Approved, Blocks, New sign-ups last 24h, New sign-ups last 7 days.
- Chart: sign-ups per day over the last 30 days, from real data.
- Activity feed: newest 20 events — sign-ups, Needs & Offers posts, introduction requests, enquiries, reports — each as "Name — Company — date" linking to the right admin screen.
- Pending badge: a red count on Approvals, Members and Blocks in the admin sidebar and on the bell in the admin header, kept current by a live subscription on new/changed sign-ups, so a new registration shows without checking email.

## 2. Pending list and the email link

- `/admin/members?filter=pending` opens the members list already filtered to people awaiting approval, newest first, with Name, Company, Email, Phone, Signed up, Company match (Yes/No — whether their company already exists as a corporate member record) and actions View / Approve / Reject.
- The daily summary email's "Review new members" button and the instant new-sign-up email's buttons point at that URL. Clicking while signed out shows the single AJBN sign-in page and then lands on the filtered list (there is one sign-in page for everyone; a separate `/admin/login` is not needed and won't be added).
- Approve keeps the existing behaviour: marks them approved, gives them the member role, writes an audit entry, sends the approval email instantly, and drops them out of pending. Reject leaves them as prospective and sends a short "not approved at this time" email. No auto-approval anywhere.

## 3. Member detail page (/admin/members/[id])

New admin-only page showing name, email and phone, company and industry, joined date, current level and role, approval history from the audit log (who did what and when), and the Needs & Offers they posted. Actions: Approve/Reject, change level, reset password, remove (existing soft delete). Reached from View in the list and from both emails' buttons.

## 4. Blocks screen (/admin/blocks)

Lists member-to-member blocks: who blocked whom, both companies, the date, and an Unblock action that removes the block. Sidebar entry "Blocks" with a count. This is the visible moderation surface for Apple's user-content requirement, alongside the existing Reports screen.

## 5. Reviewer access (moderation-only)

`apple-review@ajbn.co.uk` can open `/admin` and use Reports and Blocks with working dismiss/unblock tools, and sees the summary counts. For that account, member emails and phone numbers, approve/reject, level changes, password resets, bulk email and the audit log are hidden, with a banner: "Reviewer mode — moderation tools visible, contact details hidden for privacy." You see everything. Anyone who is neither a super admin nor the reviewer is sent to their dashboard, and the admin area stays out of the member menu.

## Technical notes

- New `src/lib/admin-dashboard.functions.ts` (server functions, super-admin/reviewer asserted as in `admin-members.functions.ts`) returning counts, the 30-day sign-up series and the activity feed from `profiles`, `user_roles`, `board_posts`, `member_blocks`, `member_intro_requests`, `service_enquiries`, `member_reports`. The reviewer variant returns counts and moderation rows only — never emails or phones — so the restriction is enforced server-side, not just hidden in the UI.
- `src/lib/admin-blocks.functions.ts` for the blocks list and unblock (delete from `member_blocks`), audited. Reject email added alongside the existing approve path in `admin-members.functions.ts` plus a new `member-not-approved` template in the email registry.
- New routes `src/routes/admin/blocks.tsx` and `src/routes/admin/members.$memberId.tsx`, both `noindex` and behind the admin guard; `Admin.tsx` routes them like the existing panels.
- `MemberManagement.tsx` reads `?filter=pending` and `?member=` from the URL to preset its filter/selection; `AnalyticsOverview.tsx` switches to live data with loading and empty states; pending count via a Supabase realtime subscription on `profiles`, feeding sidebar and bell badges.
- `RequireSuperAdmin.tsx` gains a moderation-only mode; a new `useAdminScope()` (`full` | `moderation`) drives sidebar items, columns and action visibility.
- Email links updated in `src/routes/api/public/cron/admin-digest.ts`, `src/lib/signup-notify.server.ts` and `src/lib/email-templates/admin-new-signup.tsx`. Sending already runs on the verified AJBN sender through the built-in email service — no Resend key involved.
- No schema change and no RLS change. Approval stays `profiles.is_approved` plus the member role; there are no `membership_status`, `approval_status` or `is_deleted` columns in this project and none are needed. Blocks come from `member_blocks`, Needs & Offers from `board_posts`. Member-to-member blocks carry no reason field, so the blocks list shows who/when rather than a reason.

## Verification

As super admin: real cards with pending showing Nelesh Kavia, real activity feed, View opens his detail page, approving him moves him to Approved and emails him. The pending email link while signed out goes to sign-in then the filtered list. `/admin/blocks` shows who blocked whom with Unblock. As the reviewer: `/admin` opens with Reports and Blocks working, banner shown, contact details and member actions hidden. As an ordinary member: `/admin` redirects to the dashboard.
