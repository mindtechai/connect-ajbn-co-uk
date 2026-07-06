# Admin Test Email Sender

Add a secure admin-only tool that lets a super admin send a real test copy of any auth or transactional email template to any email address, so branding/copy can be verified end-to-end in an inbox.

## User experience

New card in **Admin → Settings** (`src/components/admin/AdminSettings.tsx`) titled **"Send test email"**:

- Dropdown: template (grouped **Auth** / **Transactional**), listing all 6 auth templates (signup, magic-link, recovery, invite, email-change, reauthentication) and all registered transactional templates (currently `bulk-message`, plus any added later — pulled dynamically).
- Text input: recipient email (validated with zod, defaults to the logged-in admin's email).
- Button: **Send test**. Shows toast on success/failure and displays the message id returned.
- Small helper text: "Uses placeholder preview data. Sent via the live email pipeline (queue + domain)."

## Backend

New edge function `supabase/functions/send-test-email/index.ts` (`verify_jwt = true`):

1. Reads caller JWT, uses service-role client to check `has_role(auth.uid(),'super_admin')` — 403 otherwise.
2. Validates body with zod: `{ templateName: string, recipientEmail: string().email(), kind: 'auth' | 'transactional' }`.
3. For `transactional`: renders from `_shared/transactional-email-templates/registry.ts` using the template's `previewData`, then enqueues via `enqueue_email` on `transactional_emails` — same payload shape as `send-transactional-email` (subject, html, text, from, sender_domain, unsubscribe token, idempotency `test-<uuid>`). Bypasses the suppression check (test sends should always go through) but still logs to `email_send_log` with `template_name = 'test:<name>'`.
4. For `auth`: renders the matching template from `_shared/email-templates/` with sensible placeholder props (`siteName`, `confirmationUrl='https://connect.ajbn.co.uk/test-link'`, `token='123456'`, `email`/`newEmail`) and enqueues on `auth_emails` with the same payload shape the auth hook uses.
5. Returns `{ success, messageId }`.

Config: add `[functions.send-test-email] verify_jwt = true` block to `supabase/config.toml`.

Deploy: `send-test-email` after creation.

## Security

- Route is gated at three layers: client-side `RequireSuperAdmin` on the settings view, JWT verification by gateway, and in-function `has_role` check using service role — no client-supplied role trust.
- Rate limit: reject if the caller has enqueued >20 test emails in the last hour (query `email_send_log` where `template_name LIKE 'test:%' AND recipient_email=... AND created_at > now()-interval '1 hour'` via service role).
- Audit: insert a row into `audit_log` (existing table used by `AuditLog.tsx`) with action `email.test_send`, actor = auth.uid(), metadata = `{ templateName, recipientEmail }`.
- Recipient validated with zod `.email().max(254)`; templateName restricted to a hard-coded allow-list built from the two registries.

## Files touched

- **new** `supabase/functions/send-test-email/index.ts`
- **new** `supabase/functions/send-test-email/deno.json` (React JSX config)
- **edit** `supabase/config.toml` (add function block)
- **edit** `src/components/admin/AdminSettings.tsx` (add "Send test email" card + form)
- **new** `src/components/admin/SendTestEmailCard.tsx` (self-contained form component)

## Out of scope

- No changes to existing templates, queue, cron, or domain config.
- No new UI outside the admin settings page.
- No bulk/multi-recipient test send.
