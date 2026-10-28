# Reply to App Review (Submission 1e03dc53-9659-4a97-b1c7-666f9aec8035)

Paste this into the App Store Connect reply for Guideline 4. Nothing in the app changes.

---

Subject: Guideline 4 – Sign in with Apple: name and email no longer requested

Dear App Review Team,

Thank you for your feedback on AJBN Connect. We have fixed the Sign in with Apple issue under Guideline 4.

What changed:

1. After Sign in with Apple, the app no longer asks for name or email. It uses the name and email that Apple provides, including Hide My Email (@privaterelay.appleid.com) addresses, which we accept as they are.
2. The name Apple sends on first sign-in is saved to the member's profile straight away. It is never asked for again or overwritten.
3. New Apple members go straight to a short "Complete your profile" screen. The top of the screen shows their Apple identity as read-only text, for example: "Signed in as Salil Patankar · n7r77p9pzf@privaterelay.appleid.com".
4. That screen only asks for two things Apple doesn't provide, both needed for our business networking directory: Business Name and Service Category. Members can also tap "Later" to skip it.
5. Email and Google sign-in work the same as before.

This change is on our server, so the build you are reviewing already includes it and no new binary is needed.

How to test:
1. Open AJBN Connect and tap "Sign in with Apple".
2. Sign in with Face ID or your Apple ID password (Hide My Email can be on or off).
3. You go straight to "Complete your profile". Your Apple name and email show as read-only, and no name or email fields appear.
4. Enter a Business Name, choose a Service Category and tap Save. You then reach the Dashboard.

We tested this on the live service with a Hide My Email Apple account. The test device was an iPad Air 11-inch (M3) running iPadOS 26.0.1, the same as yours.

Please let us know if you need anything else.

Kind regards,
Salil Patankar
AJBN Connect
admin@ajbn.co.uk

---

Before you send it: sign in with Apple once on the live site with the test account you've reset, and confirm both boxes are empty and save correctly.
