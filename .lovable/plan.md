# Password settings and secure admin resets

## User-facing changes
- Add a protected `/settings` page with current password, new password, confirmation, validation, and an Update Password action.
- Verify the current password before changing it, then update the signed-in member’s authentication password.
- Link the page from the dashboard’s top-right gear icon and from the admin navigation beside “Back to Dashboard.”
- Add a “Reset Password” action for every member in `/admin/members`, with clear success and failure feedback.

## Admin security and account update
- Implement password resets as an authenticated server action that verifies the caller has the `super_admin` role before using privileged account access.
- Keep the shared reset password in a protected project secret rather than browser code, and record every reset in `admin_audit_log`.
- Use the secured admin action to set `support@ajbn.co.uk` to the requested password. Its email is already confirmed, so no confirmation change is needed.

## Verification
- Confirm the settings form rejects an incorrect current password and mismatched/weak new passwords.
- Confirm a signed-in member can change their password and continue signing in.
- Confirm the admin reset works for the support account, appears in the audit log, and the Members page remains searchable and filterable.
- Check the updated pages on desktop and mobile, then confirm the application remains error-free.

## Technical details
- Use the existing authentication client for member re-authentication and password updates.
- Use `createServerFn`, the existing bearer-token middleware, server-side role verification, and a dynamic privileged-client import for admin resets.
- Add unique `noindex, nofollow` metadata for the protected settings route.
