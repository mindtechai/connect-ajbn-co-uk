## Goal
Replace the AJBN Members' Evening mailto link with a one-click confirmation dialog that shows an on-screen success message and optionally sends both a registrant confirmation email and an organiser notification email.

## Plan

### 1. UI: interest-registration dialog

**File:** `src/components/landing/EventsSection.tsx`

- Keep the existing "Register your interest" button label, but make it open a dialog instead of opening the mailto client.
- Use a shadcn `Dialog` (or `AlertDialog`) for the confirmation:
  - Title: *Register your interest — AJBN Members' Evening*
  - Show event date, time and location.
  - **If the user is signed in:** show a short note: *We will send a confirmation email to your account email and notify the organisers.* One-click **Confirm registration** button.
  - **If the user is not signed in:** explain *Sign in to register your interest and receive a confirmation email.* Provide a **Sign in** button.
- After confirming, show an inline success message in the dialog (e.g. *You're registered — see you on 9 July!*), then auto-close after a short delay.
- Use `toast` from `sonner` (already rendered in `App.tsx`) for an on-screen confirmation as well.

### 2. Backend: store the registration (optional but recommended)

- Add a lightweight `event_interests` table or reuse `event_rsvps` if appropriate, with RLS policies so signed-in users can insert their own interest and admins can view all.
- If we keep it purely email-based, this step can be skipped; storing it is better for record-keeping and avoids duplicate registrations.
- Decision: **store** a row per user+event with an `interested_at` timestamp and unique constraint, then trigger emails from the client or from an edge function.

### 3. Email infrastructure (required for the optional emails)

Current state: no email domain or custom domain is configured.

- **User action required:** set up an email sender domain via the email setup dialog.
- Once a domain is configured, run `email_domain--setup_email_infra` to create queues, RPC wrappers, and the shared `process-email-queue` function.
- Run `email_domain--scaffold_transactional_email` to create the `send-transactional-email` edge function and sample templates.

### 4. Email templates

Create two templates in `supabase/functions/_shared/transactional-email-templates/`:

- `member-event-confirmation.tsx` — sent to the registrant:
  - Subject: *You're registered for AJBN Members' Evening*
  - Event details and a note about the organisers being in touch.
- `member-event-notification.tsx` — sent to `info@ajbn.co.uk`:
  - Subject: *New interest: AJBN Members' Evening*
  - Registrant name, email, and event details.

Register both templates in the transactional email registry.

### 5. Wiring

- From the frontend, after the user confirms, insert the interest record (if storing) and then call `supabase.functions.invoke('send-transactional-email', ...)` once for each recipient.
- Use `idempotencyKey` derived from the event id + user id to prevent duplicate emails.
- Handle loading/error states in the dialog.

### 6. Edge Function deployment

After editing or creating any templates/functions, deploy the affected Edge Functions so the latest code is served.

### 7. Verify

- Typecheck the project.
- Run a Playwright test on the Events section to confirm the dialog opens, the success message appears, and the button state updates.
- If a domain is configured, test the email sends via the send log; otherwise note that emails will activate once DNS verification completes.