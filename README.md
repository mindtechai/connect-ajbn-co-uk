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

### 2. Local development setup

1. Copy the environment example and fill in the variables from Cloud Settings:

   ```bash
   cp .env.example .env
   ```

2. Required variables:

   | Variable | Purpose |
   |----------|---------|
   | `VITE_SUPABASE_URL` | Lovable Cloud project URL |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | Lovable Cloud anon key |
   | `VITE_ASSET_BASE_URL` | Base origin for image assets (see below) |

3. Install dependencies and run:

   ```bash
   npm install
   npm run dev
   ```

### 3. Asset base URL (`VITE_ASSET_BASE_URL`)

The app resolves image assets through a pointer system. By default (`VITE_ASSET_BASE_URL` unset), asset pointers are requested same-origin, which works in the published Lovable preview. For local Vite development, set the base URL to the published app origin so images resolve cleanly:

```bash
# .env
VITE_ASSET_BASE_URL=https://impact-connect-guild.lovable.app
```

Leave it empty to keep same-origin resolution, or point it at any CDN/origin that serves the assets under the same paths.

### 4. Deploying

- **Frontend**: click **Publish** (or **Update** on subsequent deploys). Frontend changes only go live after clicking update.
- **Backend** (edge functions, DB migrations): deploy automatically — no action needed.
- **Custom domain**: after the first publish, configure it under *Project Settings → Domains*.

### 5. Email (currently not sending)

All email flows (auth verification, password reset, bulk messages, welcome, RSVP confirmation) are wired but **won't actually send until the sender domain is verified**.

To turn email on: open the sidebar → **Cloud → Emails → Set up email domain** and complete the DNS steps. Lovable manages SPF/DKIM/MX from there. Until then, delivery rows in `email_send_log` will show `failed`.

### 6. Operator features

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

### 7. Referral system

Every profile gets a unique `AJBN-XXXX####` code, generated at signup. Storing a referral code on registration links the new member back to the referrer. Leaderboards (`/dashboard`) are computed live from `profiles.referred_by_code` via the `referral_leaderboard` RPC.

### 8. Member self-serve pages

- `/dashboard` – home
- `/directory` – searchable member directory (industry filter)
- `/events` – RSVP + personal check-in QR
- `/esg` – personal impact report + CSV export
- `/lions` – apply to become an Impact Lion
- `/settings/profile` – edit profile & avatar
- `/settings/notifications` – notification preferences

### 9. Data export & backup

Cloud → Advanced → **Export data** produces a full DB dump. Members can be exported to CSV directly from `/admin/members`.

### 10. Security posture

- Row-Level Security enforced on every public table.
- Roles stored in a dedicated `user_roles` table (never on the profile) with a `has_role()` SECURITY DEFINER helper.
- Leaked-password (HIBP) protection is enabled.
- All admin routes are gated by `RequireSuperAdmin`; member routes by `RequireAuth`.
- Every role change, approval and Lion review is written to `admin_audit_log`.

### 11. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| "Published site is blank" | `.env` missing `VITE_SUPABASE_*` | Reconnect Cloud, then republish |
| Bulk email says "sent" but nobody receives | Sender domain not verified | Complete DNS setup (step 5) |
| Referral code shows as invalid on register | Case mismatch or user never confirmed email | Codes are case-insensitive; ensure referrer exists in `profiles` |
| QR check-in returns "Invalid token" | RSVP row doesn't exist | User must RSVP as "going" first |
