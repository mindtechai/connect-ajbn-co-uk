# Build 9: Sign in with Apple, remove Google Play mentions

Two of the five items in your note need work. Items 3, 4 and 5 are already live (checked before writing this): every business listing has a main service and service tags, the Matcher already shows one merged card per company, the 3-reps-per-company rule and the admin Reps badges exist, and the phone service picker is already a bottom sheet listed A-Z with a sticky button above the tab bar.

## 1. Sign in with Apple (Apple guideline 4.8)

- Turn on Apple as a sign-in option in the app's login system.
- On Sign in and Register, add a black "Continue with Apple" button in first position, directly above the Google button, same width and height. Google stays exactly as it is.
- Only name and email are requested, and Apple's private-relay email addresses are accepted.
- Nothing in the app says Google-only.

What I need from you before this can go live: Apple requires four values from your Apple Developer account — Services ID, Team ID, Key ID, and the sign-in private key (.p8 file contents). Without them the button appears but sign-in errors. If you don't have them yet, I can build everything else and add Apple the moment you send them.

## 2. Remove Google Play references (Apple guideline 2.3.10)

- The blue "Download AJBN Connect App" ribbon loses the "Get it on Google Play" button; the single remaining button becomes "Install AJBN Connect" (it already just installs the web app), and the Apple wording stops implying an App Store listing.
- Install page: the "App Store & Google Play" box becomes "Mobile app", with the Android/Google Play sentence removed.
- Full sweep of the site text for "Google Play", "Play Store" and "Android" so nothing Android-facing remains in anything an Apple reviewer sees.
- The Android build folder and the iOS Build 8 files are not touched — only the website's wording.

## 3. Verification

- Sign-in and Register pages checked on a phone-sized screen and on desktop: Apple button first, Google below, both same size.
- Whole-site text search confirms zero Google Play / Play Store / Android mentions in user-visible pages.
- Typecheck and build clean, then publish.

## Technical notes

- `src/components/AppleSignInButton.tsx` (new): `lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin ... })`, mirroring `GoogleSignInButton` (same `Button` sizing, black solid variant, Apple glyph, loading state, toast on error).
- `src/pages/Login.tsx` (2 places) and `src/pages/Register.tsx`: render `<AppleSignInButton next={next} />` above `<GoogleSignInButton />`.
- Apple provider enabled via `supabase--configure_social_auth`; Services ID / Team ID / Key ID / private key stored as secrets — pending your values.
- `src/components/DownloadRibbon.tsx`: drop the Google Play button and the `Play` icon import; keep one install button.
- `src/pages/Install.tsx`: retitle the box, drop the Android sentence.
- No migration, no schema change, no change to Directory, AI Matcher, reps limit or service tags.
