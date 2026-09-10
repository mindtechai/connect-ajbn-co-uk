# Member Portal with approval-gated profile changes

A new signed-in page at `/member-portal` where approved members maintain their business profile. Most fields save straight away; three sensitive ones (company name, logo, website) go into "pending admin approval" while the previously approved values stay visible to everyone else. Admins approve or reject each change with one click.

## Member experience (`/member-portal`)

- Only reachable when signed in as an approved member (AJBN member, Impact Lion, or admin). Prospective members see a short "awaiting approval" notice instead of the form.
- Fields that save instantly (auto-save on blur, plus a "Save changes" button): bio, phone, address, LinkedIn, other socials.
- Fields that need approval: company name, website, logo upload (JPG/PNG, max 2MB, with instant local preview).
- When one of those three is edited, it is stored as a proposed value and marked pending; a gold "Pending admin approval" badge sits next to that field, showing what was submitted versus what is currently live.
- Saving shows a toast: "Profile updated — logo pending approval" (wording adapts to which fields are pending).
- No emails are sent.

## Admin experience (`/admin/members`)

- New filter option "Pending logo/name changes", plus a count badge on the tab so pending items are visible at a glance.
- Each pending row shows the current value beside the proposed value (logo shown side by side) with single-click Approve and Reject.
- Approve copies the proposed value into the live field and clears the pending state. Reject discards the proposal and keeps the live value. Both write an entry to the existing admin audit log.

## Data changes

Extend the existing member profile table rather than adding a second `members` table, so the directory, admin screens and messaging keep working off one source of truth. New columns on `profiles`:

- `logo_url`, `pending_logo_url`, `logo_status` (`approved` | `pending`)
- `pending_company_name`, `company_name_status`
- `website`, `pending_website`, `website_status`
- `address`

Access rules: a member can read and write their own row and may only set the pending columns and instant fields — the live company name, website and logo can only be changed by an admin (enforced by a database trigger, so the approval gate cannot be bypassed from the browser). Approved members keep read access to other members for the directory. Admins can read and update all rows.

A private-by-default `member-logos` storage bucket holds uploads under `<user-id>/…`; members can upload and replace their own files, approved members and admins can read them. Reads use short-lived signed URLs, so no public bucket is required.

## Technical notes

- New route file `src/routes/member-portal.tsx` wrapped in `RequireAuth`, with `noindex, nofollow` head metadata like the other member-only routes, rendering a new `src/pages/MemberPortal.tsx`.
- Instant fields update through the browser Supabase client; the three gated fields write only to `pending_*` + `*_status`.
- Approve/reject run through a `createServerFn` with `requireSupabaseAuth` that verifies the caller holds `super_admin` via `has_role` before promoting the pending value, and logs to `admin_audit_log`.
- `src/components/admin/MemberManagement.tsx` gains the pending filter, the comparison cells and the two action buttons; existing search, role and export behaviour is untouched.
- Logo validation is enforced both client-side (type/size) and by the bucket's 2MB file-size limit.

## Out of scope

- No email notifications.
- No changes to the imported `corporate_members` company listings.
