# Android app bundle build in GitHub Actions

Add a GitHub Actions workflow that produces the Android app bundle (`.aab`) for Google Play, since the Lovable workspace has no Android SDK.

## What it does

- Runs manually from the Actions tab (same style as the existing iOS workflow).
- Sets up Node 20, Java 17, Bun and the Android SDK/build tools.
- Installs dependencies, builds the web app, syncs it into the Android project.
- Runs the release bundle task and uploads the resulting `.aab` as a downloadable artifact.

## Signing

The Android project currently has no signing configuration, so the bundle will be built unsigned. Options:

- Upload the unsigned bundle and let Google Play App Signing handle it — this still requires an upload key, so it is not enough on its own.
- Preferred: store an upload keystore as GitHub secrets (`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`). The workflow will decode the keystore and sign the release bundle only when those secrets exist; otherwise it falls back to an unsigned bundle so the build still succeeds.

## Technical details

New file `.github/workflows/android.yml`:

- `on: workflow_dispatch`, `runs-on: ubuntu-latest`
- Steps: `actions/checkout@v5`, `actions/setup-node@v4` (Node 20), `actions/setup-java@v4` (temurin 17), `oven-sh/setup-bun@v2`, `android-actions/setup-android@v3`
- `bun install`, `bun run build`
- `bunx @capacitor/cli add android || true`, then `bunx @capacitor/cli sync android`
- Optional signing step: decode `ANDROID_KEYSTORE_BASE64` to `android/app/upload-keystore.jks` and write `android/keystore.properties`; `android/app/build.gradle` gains a `signingConfigs.release` block that is applied only when that properties file is present (keeps local/Lovable builds working unchanged).
- `cd android && ./gradlew bundleRelease --no-daemon`
- `actions/upload-artifact@v5` with `android/app/build/outputs/bundle/release/*.aab`, `if-no-files-found: error`

Nothing else in the app changes.
