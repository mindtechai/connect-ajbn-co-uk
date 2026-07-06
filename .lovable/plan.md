## Goal
Add the uploaded AJBN banner to the top of every email the app sends — starting with the signup verification email — so all communications share one standardised branded header.

## Steps

1. **Set up sender domain** (prerequisite)
   - No sender domain is currently configured, so no branded email (auth or app) can be sent yet.
   - Open the email setup dialog so you can configure a sender subdomain (e.g. `notify.ajbn.co.uk`) and add the DNS records. This is a one-time step.

2. **Host the banner on the CDN**
   - Upload `banner-ajbnconnect_email_confmtn.-2.png` as a Lovable Asset so it has a stable public URL usable inside emails (email clients can't load `src/assets` imports).

3. **Scaffold branded auth email templates**
   - Generate the six auth templates (signup confirmation, magic link, password recovery, invite, email change, reauthentication) plus the `auth-email-hook` edge function.
   - Add the banner `<Img>` at the top of every template, styled to full container width with proper alt text.
   - Apply AJBN brand colours (navy/teal, gold accents) to buttons, headings, and links so the template matches the app.
   - Deploy `auth-email-hook`.

4. **Standardise the banner across app (transactional) emails**
   - Create a shared `EmailHeader` component in `supabase/functions/_shared/transactional-email-templates/` that renders the banner.
   - Update every existing transactional template (e.g. `bulk-message` used by `send-bulk-message`) to import and render `EmailHeader` at the top.
   - Any future templates added to the registry will use the same header component.
   - Redeploy `send-transactional-email`.

5. **Verify**
   - Preview the signup confirmation template from Cloud → Emails.
   - Trigger a test signup once DNS verifies and confirm the banner renders in the inbox.

## Notes
- Email `<Body>` background stays white; the banner sits inside the container so it looks like a header strip.
- The banner is a single image (contains logos + contact block). No text overlay needed in code.
- Unsubscribe footer is appended automatically by the platform — not added to templates.
- No app/business logic changes; this is purely email presentation.
