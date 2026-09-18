# Apple review account ready for Build 8

## What I checked (current state)

The account `apple-review@ajbn.co.uk` already exists and is in good shape:

- Email confirmed
- Access level: super admin (highest)
- Approved: yes
- Messaging: active
- Not deleted
- Name currently shows as "Apple Reviewer"; membership level is "Free"

So no gating bypass or new permissions are needed — super admin already unlocks Directory, Messages, Referral Rewards, Impact Lions, Services, Events and Profile editing, and the "pending approval" banner never shows for approved accounts.

## What will change

1. **Password** set to `AppleTest2026!` exactly, email kept confirmed.
2. **Name** set to "Apple Review" (as requested).
3. **Membership level** set to Fully Paid so nothing on screen looks limited.
4. **Deletion protection** — the public deletion request form will refuse this email with the message "Review account cannot be deleted", so it cannot be accidentally removed before review.
5. **Audit entry** recorded for the change.

## Verification

Sign in at the live login page in a clean session with those credentials and confirm the home/dashboard loads with Directory, Messages, Referral Rewards and Impact Lions all reachable, plus the admin area. I'll report back what each screen showed.

## Notes on a few requested items

- Per-email hardcoded bypasses in access checks are deliberately not added: the account already has the highest access level, and an email-based exception in the security rules would be a real weakness left in the live app after review. The same result is achieved through the role it already holds.
- Fields like `is_admin`, `is_super_admin`, `is_verified`, `can_access_*` don't exist in this app's data model — access is decided by the separate permissions table (which is what prevents privilege-escalation attacks). Super admin there covers every one of those flags.

## Technical steps

1. Auth admin update on user `1663c887-971b-41dc-ac13-4eb7ffd753b0`: `password`, `email_confirm: true`.
2. `UPDATE public.profiles SET first_name='Apple', last_name='Review', membership_tier='fully_paid'` for that id.
3. Add an email guard in `src/lib/account-deletion-request.server.ts` (and matching inline error in `src/pages/AccountDeletion.tsx`) rejecting `apple-review@ajbn.co.uk` before insert.
4. Insert an `admin_audit_log` row for the update.
5. Playwright check of `/login`, `/dashboard`, `/directory`, `/messages`, `/referral-rewards`, `/lions`, `/admin/members`.
