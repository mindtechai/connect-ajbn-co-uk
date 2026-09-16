# Super-admin Members panel + daily email link

## What exists today (checked)

- `/admin/members` already exists and is restricted to super admins (Russell and you). It lists all members with search, status/membership/pending-change filters, CSV export, "Promote to AJBN Member", password reset, Quiet Hours toggle, company linking and audit logging.
- The member records have no "city", no "membership" level and no approved flag; approval today is implied by the member's role. There is also no soft-delete marker.
- The daily summary email already links each section to `/admin` (the admin overview), not to the public directory.

## What changes

### 1. Members panel upgrades

Keep everything already working and add:

- **Header line**: "Admin Members Log — showing X of Y members — N pending: <names>" naming the pending sign-ups (e.g. Saal Pat TEST, Laura Bahar) with their email.
- **Columns**: Name, Email, Company, Industry, City, Role dropdown (Prospective / AJBN Member / Super Admin), Approved yes/no toggle, Membership dropdown (Free / Corporate / Fully Paid), Actions.
- **Inline editing**: click a name, company, industry or city cell to edit and save straight away.
- **Sort A–Z** by name, alongside the existing search and a Role filter.
- **Actions**: Approve as Member (sets AJBN Member role + approved, sends the welcome email), Upgrade to Fully Paid Corporate, Make Super Admin, and Delete with a confirmation dialog (soft delete — the row is hidden, nothing is erased).
- **Add New Member** button opening a dialog for name, email, company and role; it creates the account and its role.
- Mobile cards get the same role, approved, membership and action controls.
- `/directory`, `/messages`, `/profile` and every other member page stay exactly as they are. No new public pages.

### 2. Daily summary email

Every "Review new members" style button in the daily admin summary points to `https://connect.ajbn.co.uk/admin/members`, so one click lands on this panel where Laura can be upgraded to Fully Paid in a single click. Button wording stays the same.

## Technical notes

- Migration adds to `profiles`: `city text`, `membership_tier text` (default `free`, one of free/corporate/fully_paid), `is_approved boolean not null default false`, `deleted_at timestamptz`. Existing members with an `ajbn_member`/`impact_lion`/`super_admin` role are backfilled to `is_approved = true`. Member-facing self-update policies stay unchanged; the existing profile-field protection trigger is extended so members cannot set their own `is_approved`/`membership_tier`/role fields — only super admins can.
- All privileged mutations (role change, approve, membership tier, super-admin grant, soft delete, create member) go through new authenticated server functions in `src/lib/admin-members.functions.ts` that verify `has_role(auth.uid(), 'super_admin')` before acting, write to `admin_audit_log`, and use the service-role client only inside the handler (needed for creating auth users).
- Welcome email reuses the existing app-email sender and a new `member-welcome` template registered in `src/lib/email-templates/registry.ts`.
- Every directory/member read filters `deleted_at is null`, including `member_directory_list` so soft-deleted members disappear from `/directory`.
- `src/routes/api/public/cron/admin-digest.ts`: `ADMIN_URL` becomes `https://connect.ajbn.co.uk/admin/members`.
- UI stays in the existing `MemberManagement.tsx` with current shadcn components; no new libraries.
