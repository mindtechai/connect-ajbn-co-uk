# Fix Apple Guideline 4 – no re-asking for name/email after Sign in with Apple

## Finding
The app has no dedicated "complete profile" page today. After Apple sign-in, members land on the Dashboard, whose "Complete Profile" button opens Profile Settings, where First/Last name show as blank editable inputs (Apple's name is never copied into the profile). That is what reads to Apple as "asking again".

## What changes
1. **New "Complete your profile" page** (`/complete-profile`, signed-in only).
   - Apple users (`app_metadata.provider === 'apple'` or `app_metadata.providers` includes `'apple'`):
     - Name taken from `user_metadata.full_name` / `name` / `fullName` (or `given_name`/`family_name`) and email from `user.email` — relay addresses (@privaterelay.appleid.com) accepted as-is.
     - Shown as read-only "Signed in as Name · email" summary, never as required inputs.
     - Only asks for **Business Name** and **Service Category** (category from the existing service taxonomy list).
   - Email / Google users: same page also shows editable first name, last name (prefilled where known), plus Business Name and Service Category — current behaviour kept.
2. **Save Apple name on first login**: on the first Apple session, if the profile's first/last name are empty, split the Apple full name and write it to the member's own profile row (plus `user_metadata.full_name` so it persists even though Apple only sends it once). Never overwrites a name already saved; never touches membership tier, referral code or the sign-up trigger.
3. **Routing**: after sign-in, if the profile is missing company or service category, send the member to `/complete-profile` once; Dashboard "Complete Profile" button points there when those are missing, otherwise to Profile Settings as today.
4. **Profile Settings**: for Apple users, name and email shown read-only (prefilled from Apple), so the settings page never presents them as fields to fill.

## Untouched
iOS build files, Apple/Google button order and styling, Report/Block, RLS, email validation (relay domains stay allowed), sign-up trigger.

## Release
Web-only change — publish to connect.ajbn.co.uk; the reviewed iOS app loads the live site, so no new build is required. You can reply to Apple in App Store Connect after publish.

## Technical details
- New `src/routes/_authenticated/complete-profile.tsx` (or matching existing auth pattern) + `src/lib/apple-identity.ts` helper (`isAppleUser`, `appleDisplayName`), with a small vitest for the helper.
- Writes via browser client to `profiles` (company, primary_sector, services_list, first_name, last_name) under existing own-row RLS; company change follows the existing company-name approval path if required by triggers (verified during build).
- Service categories from `service_taxonomy` (active, sort_order).
