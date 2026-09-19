# Confirm company visibility rule, re-verify, publish

The migration you approved has already been applied and the change is live. Checked just now against the real data:

- Accounts: 11, member records: 11 — unchanged.
- 6 pending members all still have their referral code and membership tier.
- Company listings: 135 total, with the one belonging to a pending member hidden from the Companies tab (134 visible).
- The three helper checks and the single company visibility rule are in place, with the admin bypass and the "owner approved" check kept.

So no new database change is needed — a second migration would only duplicate what exists.

## What I'll do

1. Re-run the code and build checks (type check, whitespace check, production build).
2. Run one browser pass at 1280x1800 signed in as salil@proactiveconsultancy.co.uk only: Companies tab shows 134 listings without the pending member's company; directory cards still show Book 1-2-1, Message, Block user, Report user.
3. Report the three audits again in short form: sign-up/approval/password-reset flow, data preservation counts, and access rules per table.
4. Publish to https://connect.ajbn.co.uk.

## Notes

- No schema, access-rule, or Build 8 changes.
- Reported but not changed: zeus@ajbn.co.uk has never confirmed their email address.
- Pre-existing database linter warnings about internal functions are left as they are.
