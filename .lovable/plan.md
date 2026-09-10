# Fix the Impact Lions "Join for £250/year" button

## What's wrong today

On the Impact Lions page, the Join button always sends people to the general AJBN sign-up form, even when they are already an approved AJBN member. The Lions application form itself is also still a demo: it only saves the answer in the browser, so nobody at AJBN ever receives it.

## What will change

### 1. Button behaviour on /lions (both Join buttons)

- Signed in as an active member (AJBN member, Impact Lion, or super admin): the button goes straight to the Lions application form at /lions/apply.
- Signed out, or membership still awaiting approval: the button goes to the AJBN sign-up form as now, and a line of text underneath reads "First join AJBN, then you can apply for Impact Lions for £250/year".

Page design, colours and layout stay exactly as they are.

### 2. Real Lions application form

/lions/apply gets three questions plus a confirmation box:

- Why do you want to join the Impact Lions Club?
- Your LinkedIn profile
- Your referral / introduction experience
- Checkbox: "I agree to pay the £250 annual Impact Lions contribution"

Submit is only enabled once the reason and the checkbox are filled in. Members who are not yet approved AJBN members see a short note instead of the form.

### 3. Submission is saved and emailed

Submitting saves a real application record (replacing the browser-only demo storage), shows the existing "Application Submitted" confirmation, and emails the details to salil@ajbn.co.uk so it is actioned. Existing status handling (pending / approved / rejected with reviewer notes) and the admin review screen keep working unchanged.

## Technical notes

- `src/pages/Lions.tsx`: replace the hardcoded `user ? ... : ...` link targets with a role check from `useAuth()` (`ajbn_member` | `impact_lion` | `super_admin`); add the helper text for the non-approved branch.
- Migration: add `linkedin_url text`, `referral_experience text`, `payment_ack boolean not null default false` to `public.lion_applications`. Existing RLS (own-insert, own-select, admin-update) and grants stay as they are.
- `src/pages/LionApplication.tsx`: drop the `localStorage` demo path; read the caller's existing row via the browser client and insert on submit; keep the current success panel.
- New `src/lib/lion-application.functions.ts` + `lion-application.server.ts` following the `member-report` pattern: `requireSupabaseAuth`, verify the row belongs to the caller, then `sendAppEmail` to `salil@ajbn.co.uk` with an idempotency key on the application id and reply-to the applicant.
- New branded template `src/lib/email-templates/lion-application.tsx` registered in `registry.ts` (uses the shared `EmailHeader`).
- Verification: sign in as demo@ajbn.co.uk (an approved AJBN member), confirm the Join button lands on the Lions application form and not the AJBN register page, submit a test application, confirm the row is stored, then remove the test row.
