# Signed Android app bundle for Google Play

Goal: produce a signed release AAB for `uk.co.ajbn.connect` that you can upload to Play Console, using a single upload key that stays valid for every future build.

## What happens

1. **Create the upload key.** Generate `upload-keystore.jks` (RSA 2048, 10000 days, alias `upload`, the details you supplied: AJBN / Asian Jewish Business Network / London / GB). Java isn't installed in this workspace, so the key is generated with a temporary Java toolchain just for this step.
2. **Hand you the key safely.** The keystore file is saved as a download for you, plus its base64 text and the four values to paste into GitHub as repository secrets. The base64 is a signing credential, so it is delivered as a file rather than pasted into this chat. Losing this key means never being able to update the app on Play, so keep a copy somewhere safe.
3. **Signing config in Gradle.** `android/app/build.gradle` already reads `android/keystore.properties` and applies a release signing config when it exists; debug builds are untouched. Only a small hardening pass is needed so an incomplete properties file can't silently produce an unsigned bundle. A committed `android/keystore.properties.example` template documents the four fields.
4. **The keystore itself is not committed.** The build workflow rebuilds it from the GitHub secret at run time. Committing a keystore and its password to the repository would let anyone who sees the code sign releases as AJBN.
5. **Fix the workflow.** `.github/workflows/android.yml` keeps the manual "Run workflow" trigger and the current shape (ubuntu-latest built-in Android SDK, Node 20, Java 17, Bun, `bun install`, `bun run build`, `cap sync android`). Added: a step that decodes `ANDROID_KEYSTORE_BASE64` into `android/app/upload-keystore.jks` and writes `android/keystore.properties` from the secrets before `./gradlew bundleRelease`. If the secrets are absent the run still completes, but the bundle is unsigned and clearly labelled as such.
6. **Deliver the AAB.** The bundle is uploaded as the run artifact `AJBN-Android-AAB`. The actual signed AAB can only be produced by the GitHub run (no Android SDK here), so after you add the four secrets and start the workflow, I check the run and confirm the artifact.

## Secrets you add in GitHub (Settings, Secrets and variables, Actions)

- `ANDROID_KEYSTORE_BASE64` — the base64 text from the delivered file
- `ANDROID_KEYSTORE_PASSWORD` — the store password you specified
- `ANDROID_KEY_ALIAS` — `upload`
- `ANDROID_KEY_PASSWORD` — the key password you specified

## Note on the password

The password you sent in this chat is now in the conversation history. If you'd prefer, I can generate the key with a fresh strong password instead and give you that one with the keystore.

## Technical detail

- `keytool -genkeypair -keystore android/app/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload` run under a temporary JDK 17.
- `android/keystore.properties` fields: `storeFile=upload-keystore.jks` (resolved relative to `android/app`), `storePassword`, `keyAlias`, `keyPassword`.
- `.gitignore` additions: `android/app/*.jks`, `android/keystore.properties`.
- Workflow decode step: `echo "$ANDROID_KEYSTORE_BASE64" | base64 -d > android/app/upload-keystore.jks`, guarded on the secret being non-empty.
