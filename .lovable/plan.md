# Create support@ajbn.co.uk as a Super Admin account

## Goal

Create a real login account for support@ajbn.co.uk and give it full super admin access so it can review safety reports, approve members, and manage the portal. It will also keep receiving safety-report emails (already routed there).

## Steps

1. **Create the login account**
   - Sign up support@ajbn.co.uk through the app's existing Register page (this creates the auth user and profile automatically via the existing `handle_new_user` trigger).
   - Password: set at registration by you (Salil), or I can set a temporary one and you change it after first sign-in — I'll confirm which you prefer at execution time.
   - New accounts register as `prospective_member` by default.

2. **Promote to super admin** (database migration)
   - Insert `super_admin` role for the support@ajbn.co.uk user into `user_roles`.
   - Remove the default `prospective_member` role for that account.
   - Record the change in `admin_audit_log`.

3. **Verify**
   - Sign in as support@ajbn.co.uk in the preview and confirm:
     - Admin panel (`/admin`) is accessible.
     - Safety reports inbox and member approval screens load.
   - Confirm the account appears correctly in the members list.

## Notes

- No changes to admin@ajbn.co.uk — it stays an email-only inbox for daily digests.
- Nothing will be published to the live site until you ask.
