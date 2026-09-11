# Set up both reviewer accounts (Google Play + Apple)

## What will change

Two existing accounts get updated. No other account's password is touched.

### 1. support@ajbn.co.uk
- Password set to `AjbnTest2026`, email marked confirmed (it is already confirmed).
- Name changed to "G Console Reviewer", company "Google".
- Keeps full super admin access (already has it).

### 2. apple-review@ajbn.co.uk
- Password set to `AppleTest2026!`, email marked confirmed (currently NOT confirmed, so this is needed for login).
- Name "Apple Reviewer", company "Apple".
- Upgraded from member to full super admin access.

### 3. Verification
Sign in with both accounts on the live login page, confirm the dashboard and admin panel open, then report back a table with email, access level, name, company, and confirmed status.

## Notes on the requested fields

Two details in your instructions don't match how this app stores data, so they will be handled the equivalent way:

- **Access level ("role")** is not stored on the member profile — it lives in a separate permissions table, which is what keeps the app safe from privilege-escalation. Super admin will be granted there.
- **"display_name", "is_active", "status"** don't exist as profile fields here. The displayed name comes from first name + last name, and "approved" status is expressed by the access level itself (super admin = fully approved and active). So setting the name and granting super admin already produces exactly what you asked for.

## Technical steps

1. Auth admin update for both users: `password`, `email_confirm: true` (via privileged server-side Supabase Auth Admin call).
2. `UPDATE public.profiles SET first_name, last_name, company` for both ids.
3. `INSERT INTO public.user_roles (user_id, 'super_admin') ON CONFLICT DO NOTHING` for apple-review; delete its `prospective_member` and `ajbn_member` rows.
4. Write both changes into `admin_audit_log`.
5. Browser check of `/login`, `/dashboard`, `/admin/members` for each account; report results.
