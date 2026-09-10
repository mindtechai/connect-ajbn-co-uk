# Admin email alerts

## How it works today

- Member safety reports are the only thing emailed out, and they currently go to russell@ajbn.co.uk.
- Everything else — logo/company name/website approval requests, Added Value Services enquiries, introduction requests, account deletion requests, new sign-ups and Impact Lion applications — only shows up inside the admin area. No email is sent, so nobody is nudged to look.

## What changes

1. **Safety reports move inbox**
   Report alerts stop going to russell@ajbn.co.uk and go to support@ajbn.co.uk instead, still sent the moment a report is filed (these stay immediate because they are urgent).

2. **One daily summary to admin@ajbn.co.uk**
   A single branded email arrives each morning (07:00 UK time) listing everything that needs attention, grouped into sections:
   - Profile changes waiting for approval (member name, what changed: logo, company name, website)
   - New Added Value Services enquiries
   - New introduction requests
   - New account deletion requests
   - New members who signed up and new Impact Lion applications

   Each section shows counts plus the individual items from the last 24 hours, with a button through to the matching admin screen. If nothing happened, no email is sent that day, so the inbox stays quiet.

3. The admin area itself is unchanged — the summary is a nudge, not a replacement.

## Technical notes

- New app-email template `admin-daily-digest.tsx` in `src/lib/email-templates/`, registered in `registry.ts`, using the existing `EmailHeader` branding.
- New cron endpoint `src/routes/api/public/cron/admin-digest.ts`: verifies a shared secret header (new `ADMIN_DIGEST_SECRET`), gathers the last 24 hours from `profiles` (pending status columns + `created_at`), `service_enquiries`, `member_intro_requests`, `account_deletion_requests`, `lion_applications` via the service-role client, then sends one email through `sendAppEmail` with an idempotency key of `admin-digest-<date>`.
- Scheduled with `pg_cron` + `pg_net` calling the stable project URL daily at 06:00 UTC.
- Recipient addresses defined as constants: `ADMIN_EMAIL = admin@ajbn.co.uk`, and `TEAM_EMAIL` in `src/lib/member-report.server.ts` changed to `support@ajbn.co.uk`.
- Only email routing changes; no schema changes to existing tables and no changes to member-facing emails.

## Please confirm

Both admin@ajbn.co.uk and support@ajbn.co.uk need to be real, working mailboxes — otherwise the alerts will bounce and get blocked.
