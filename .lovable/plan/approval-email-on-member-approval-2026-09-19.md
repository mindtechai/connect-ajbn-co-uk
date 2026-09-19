# Approval email on member approval

## What happens today (verified in code)

- Approving a member in `/admin` already: flips `is_approved`, grants the `ajbn_member` role, writes to the audit log, and sends the member a branded welcome email through Lovable's managed email service (`setMemberApproved` in `src/lib/admin-members.functions.ts`, template `member-welcome`).
- Rejecting already sends the existing "application not approved" email — this stays exactly as is.
- No Resend key exists or is needed: email goes through Lovable's built-in email service with the verified AJBN sender (`noreply@connect.ajbn.co.uk`). This keeps one email pipeline for the whole app instead of adding a second provider.

## Changes

1. **Approval email content** — update the `member-welcome` email template so it says:
   - "Your AJBN Connect account is now approved."
   - Sign-in button linking to `https://connect.ajbn.co.uk/dashboard`.
   - "Your company ({company}) is now visible in the member directory" — shown when the member has a company on record.
2. **Pass the company name** — `setMemberApproved` already fetches the member's email and first name; extend that lookup to include `company` and pass it into the template data.
3. **Toast** — in `src/components/admin/MemberApprovals.tsx`, after a successful approve show "Approved + email sent" (or "Approved — email could not be sent" if the send reports a failure, so you always know).

## What does NOT change

- Rejection email — untouched.
- Approval logic, roles, audit log — untouched.
- `ios-ajbn/`, Build 8, `github-workflow-build5.yml` — untouched.
- No Resend, no new edge function, no new keys, no database or schema changes.

## Verification

- `bunx tsgo --noEmit`, `git diff --check`, `bun run build`.
- Browser check signed in as salil@proactiveconsultancy.co.uk (super admin): `/admin` and `/admin/members?filter=pending` load without bouncing to the dashboard, all 6 pending members listed.
- Publish to https://connect.ajbn.co.uk.
