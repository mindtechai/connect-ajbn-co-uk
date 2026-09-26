# Allow Apple Hide My Email relay domains

## Goal
Apple "Hide My Email" addresses (`@privaterelay.appleid.com` and `@private.icloud.com`) must be accepted everywhere — sign-up, sign-in, and every email validation in the app — so Apple users can create accounts.

## What I found
- No disposable-email blocklist exists in the app code or the database. Searched all source, migrations, and database functions/triggers for `privaterelay`, `icloud`, `disposable`, `mailinator`, and domain-block logic — nothing blocks these domains today.
- `src/lib/apple-relay.ts` already accepts both relay domains (display-only helper used in the admin member detail).
- Registration (`src/pages/Register.tsx`) and login pass the email straight to the backend auth service with no domain filtering.
- The only remaining place a block can live is the backend auth service's own email settings (a domain blocklist configured outside the code).

## Changes
1. **Backend auth settings**: check the email settings for any domain blocklist / disposable-email rejection and remove entries covering `privaterelay.appleid.com` and `private.icloud.com`, so the auth service accepts account creation from both domains.
2. **Code guard**: add a small shared email-validation helper (or extend `apple-relay.ts`) so any current or future email check explicitly whitelists both relay domains before applying any other rule; wire it into the email validations that exist (`AccountDeletion`, `ServiceEnquiryDialog`, `MemberIntroRequests`, `SendTestEmailCard`) so they can never reject relay addresses.
3. **Verify**: typecheck + build; confirm a relay-format address passes each validation path.
4. **Publish** to connect.ajbn.co.uk.

## Untouched
- iOS project files, `handle_new_user` trigger, Build 8, Report/Block, Apple+Google sign-in tandem, offline memberships.

## Technical notes
- Auth settings change via the backend configuration tool (no migration needed unless a setting requires SQL).
- Helper stays display-only for admin; validation guard is additive and changes no UI.
