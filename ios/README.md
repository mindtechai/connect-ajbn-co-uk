# AJBN Connect — iOS (App Store) build

This folder is the native iPhone/iPad wrapper for the live site
`https://connect.ajbn.co.uk`. All web/PWA logic stays on the website; the
wrapper only provides the store presence, app icon and splash screen.

## What is already configured

| Setting | Value |
| --- | --- |
| Bundle ID | `uk.co.ajbn.connect` (matches the Android release) |
| App name | AJBN Connect: B2B Network |
| Version | 1.0.0 (build 1) |
| Privacy policy | `https://connect.ajbn.co.uk/privacy` (`NSPrivacyPolicyURL`) |
| Camera | `NSCameraUsageDescription` — profile photo / company logo |
| Photos | `NSPhotoLibraryUsageDescription` — profile photo / company logo |
| Other permissions | none — no location, no contacts, no microphone |
| Icon / splash | generated from the same artwork as Android (`public/icon-512.png`, navy `#174164`) |
| Encryption declaration | `ITSAppUsesNonExemptEncryption = false` (HTTPS only) |

## Producing the upload build (must run on a Mac)

Apple's toolchain only runs on macOS, so the archive/IPA has to be produced
there:

```bash
bun install
bun run build
npx cap sync ios
cd ios/App
pod install
```

Then either:

**Xcode (recommended)** — open `ios/App/App.xcworkspace`, select
*Any iOS Device (arm64)*, then *Product > Archive*, then *Distribute App >
App Store Connect*. This signs and uploads in one step.

**Command line, unsigned archive for Transporter:**

```bash
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release \
  -sdk iphoneos -archivePath build/App.xcarchive archive \
  CODE_SIGNING_ALLOWED=NO CODE_SIGNING_REQUIRED=NO CODE_SIGN_IDENTITY=""
mkdir -p build/Payload
cp -R build/App.xcarchive/Products/Applications/App.app build/Payload/
cd build && zip -r AJBNConnect-1.0.0-unsigned.ipa Payload
```

Note: App Store Connect rejects unsigned binaries, so the unsigned IPA is only
useful for inspection. For the real Transporter/App Store upload the archive
must be signed with the Apple Developer team (verification `788C85L79P`).
