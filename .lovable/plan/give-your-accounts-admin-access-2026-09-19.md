# Give your accounts admin access

The admin area already has everything you asked for — member counts, pending approvals, blocks, reports and the audit log. The reason you can't get in is that your own account isn't marked as an admin, so /admin sends you back to the dashboard. Only apple-review@ajbn.co.uk and support@ajbn.co.uk have admin rights today.

## What I'll do

Give full admin rights to these four addresses:

- salil@proactiveconsultancy.co.uk (account exists — admin immediately)
- russell@springadconsultancy.co.uk (account exists — admin immediately)
- salil@ajbn.co.uk (no account yet — becomes admin as soon as it registers and confirms its email)
- russell@ajbn.co.uk (no account yet — same)

Then I'll sign in as salil@proactiveconsultancy.co.uk and check that the admin overview, pending list, blocks, reports and audit log all open and show real data.

## Technical notes

- One database change: insert the super_admin role for the two existing accounts, and extend the existing email-confirmation trigger so the two @ajbn.co.uk addresses are granted admin on confirmation.
- No other schema, access-rule or app-code changes; the reviewer account keeps its restricted, view-only behaviour.
- Nothing about approvals changes — members still need manual approval.
- Publish afterwards so it applies on connect.ajbn.co.uk.
