# Apple sign-in on your own credentials

Switch Apple sign-in away from the managed Apple credentials and onto your own Service ID `uk.co.ajbn.connect.signin`, and make the two buttons on the sign-in page visually equal with Apple first.

## What changes on the page

- Sign in and Register: Apple button first, Google second.
- Both buttons: full width, exactly 44px tall, same corner radius and font size — equal prominence.
- Apple button in Apple's official style: solid black, white Apple logo, "Continue with Apple".
- Apple asks for name and email only, and "Hide My Email" relay addresses are accepted as normal sign-ins.

## What changes behind the scenes

- The Apple button stops going through Lovable's managed Apple login and signs in directly with your own Apple Service ID.
- Google is untouched and keeps working exactly as today.

## What I need from you

Your own Apple credentials must be entered in the backend before the Apple button will work. From your Apple Developer account:

- Services ID: `uk.co.ajbn.connect.signin`
- Team ID, Key ID, and the sign-in private key (.p8 file contents)

In the backend, open Users → Authentication Settings → Sign In Methods → Apple, choose "Use your own credentials", generate the secret from those four values, and save. Also in Apple Developer, under that Services ID → Sign In with Apple → Configure, add the domain `connect.ajbn.co.uk` and the backend callback URL (I will give you the exact callback URL when you get there).

Until that is saved, the Apple button will show an error on tap. Everything else in this change is safe to ship now.

## Technical notes

- `src/components/AppleSignInButton.tsx`: replace `lovable.auth.signInWithOAuth("apple", ...)` with
  `supabase.auth.signInWithOAuth({ provider: "apple", options: { scopes: "name email", redirectTo, queryParams: { response_mode: "form_post" } } })`,
  keeping the loading state and error toast. Class: `w-full h-11 gap-2 bg-black text-white hover:bg-black/90 text-[15px]`.
- `src/components/GoogleSignInButton.tsx`: add `h-11 text-[15px]` so heights and type size match; no logic change.
- `src/pages/Login.tsx` (both forms) and `src/pages/Register.tsx`: order already Apple then Google — no change needed.
- Apple provider switched from managed to own credentials in backend auth settings; `src/integrations/lovable` stays in place for Google.
- No migration, no schema change, iOS Build 8 files untouched.
