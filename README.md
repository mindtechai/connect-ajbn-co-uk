# AJBN Member Portal

Member-only networking portal for the Asian-Jewish Business Network, with the Impact Lions Club as its charitable arm.

**Stack:** React + Vite + Tailwind · Lovable Cloud (Supabase Auth / Postgres / Storage / Edge Functions).

---

## Quick start (operator runbook)

### 1. First-time super admin setup

Two super-admin emails are hard-coded in the `handle_new_user` and `grant_super_admin_on_verify` DB triggers:

- `russell@ajbn.co.uk`
- `salil@ajbn.co.uk`

Any user signing up (or verifying) with one of those emails is automatically promoted to `super_admin`. To add more, edit both trigger functions via a new migration.

### 2. Deploying

- **Frontend**: click **Publish** (or **Update** on subsequent deploys). Frontend changes only go live after clicking update.
- **Backend** (edge functions, DB migrations): deploy automatically — no action needed.
- **Custom domain**: after the first publish, configure it under *Project Settings → Domains*.

### 3. Email (currently not sending)

All email flows (auth verification, password reset, bulk messages, welcome, RSVP confirmation) are wired but **won't actually send until the sender domain is verified**.

To turn email on: open the sidebar → **Cloud → Emails → Set up email domain** and complete the DNS steps. Lovable manages SPF/DKIM/MX from there. Until then, delivery rows in `email_send_log` will show `failed`.

### 4. Operator features

| Area | Route | Notes |
|------|-------|-------|
| Analytics overview | `/admin` | Real-time KPIs |
| Member management | `/admin/members` | Role toggle, suspend, CSV export |
| Approvals | `/admin/approvals` | Approve as member or Lion |
| Lion applications | `/admin/lions` | Self-serve applications from members |
| Events | `/admin/events` | CRUD, fundraising targets |
| Event check-in | `/admin/checkin` | Scan member QR codes at the door |
| ESG | `/admin/esg` | Record donations & volunteer hours |
| Bulk actions | `/admin/bulk-actions` | Segmented in-app + email blasts |
| Audit log | `/admin/audit` | Last 200 admin actions |
| Settings | `/admin/settings` | Portal config |

### 5. Referral system

Every profile gets a unique `AJBN-XXXX####` code, generated at signup. Storing a referral code on registration links the new member back to the referrer. Leaderboards (`/dashboard`) are computed live from `profiles.referred_by_code` via the `referral_leaderboard` RPC.

### 6. Member self-serve pages

- `/dashboard` – home
- `/directory` – searchable member directory (industry filter)
- `/events` – RSVP + personal check-in QR
- `/esg` – personal impact report + CSV export
- `/lions` – apply to become an Impact Lion
- `/settings/profile` – edit profile & avatar
- `/settings/notifications` – notification preferences

### 7. Data export & backup

Cloud → Advanced → **Export data** produces a full DB dump. Members can be exported to CSV directly from `/admin/members`.

### 8. Security posture

- Row-Level Security enforced on every public table.
- Roles stored in a dedicated `user_roles` table (never on the profile) with a `has_role()` SECURITY DEFINER helper.
- Leaked-password (HIBP) protection is enabled.
- All admin routes are gated by `RequireSuperAdmin`; member routes by `RequireAuth`.
- Every role change, approval and Lion review is written to `admin_audit_log`.

### 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| "Published site is blank" | `.env` missing `VITE_SUPABASE_*` | Reconnect Cloud, then republish |
| Bulk email says "sent" but nobody receives | Sender domain not verified | Complete DNS setup (step 3) |
| Referral code shows as invalid on register | Case mismatch or user never confirmed email | Codes are case-insensitive; ensure referrer exists in `profiles` |
| QR check-in returns "Invalid token" | RSVP row doesn't exist | User must RSVP as "going" first |
