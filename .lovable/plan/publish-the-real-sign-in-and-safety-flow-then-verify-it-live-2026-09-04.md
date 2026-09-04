# Publish the real sign-in and safety flow, then verify it live

The current build is healthy (latest build check passed). This plan publishes it to connect.ajbn.co.uk and then checks, from outside the editor, that sign-in and the block/report tools genuinely work.

## What gets published

No new code changes. The build already contains:
- Real sign-in and registration through the backend (no more browser-only fake logins).
- Block and Report saved to the database, so the team actually receives reports.
- The admin Reports page for reviewing what members submit.
- Email alert to the AJBN team when a report is submitted.

## Steps

1. Run a security scan and report any critical findings before publishing. If any are critical, pause and ask before continuing.
2. Publish the project to the live site.
3. Confirm the live site is serving the new build (fresh, uncached request).
4. Verify end to end on the live site:
   - Sign in with a real account and confirm the session is a genuine backend session, not a local one.
   - Confirm a wrong password is refused (proof the old "any password works" behaviour is gone).
   - Block a member, reload, and confirm the block persists and hides them from the directory and inbox.
   - Submit a report and confirm a matching row exists in the database.
   - Confirm the report appears on the admin Reports page.
   - Confirm the team notification email was queued/sent for that report.
5. Report exactly what was observed for each check, including anything that fails.

## Notes

- Nothing in the database, permissions, member data or page layouts changes.
- If any live check fails, I will report it plainly rather than declaring success, and propose a follow-up fix.
- Verification uses an existing member account; no new accounts are created unless needed, and no credentials are shown in chat.
