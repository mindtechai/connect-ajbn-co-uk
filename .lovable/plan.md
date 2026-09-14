# Unify and publish the AJBN Connect app icon

## Outcome
Use the existing dark-blue square **AJBN CONNECT** artwork as the sole icon across the website, installed PWA, Android app, and iOS app. Keep the displayed app name as **AJBN Connect** and remove every remaining maroon or long-form AJBN logo from icon surfaces.

## Changes
1. **Create one canonical icon source**
   - Treat the current `public/icon-512.png` artwork as the approved source; it visually matches the supplied dark-blue **AJBN CONNECT** icon.
   - Generate each required size from that source with high-quality square scaling, without changing its colour, typography, crop, or adding platform-specific artwork.

2. **Replace every web/PWA icon variant**
   - Replace the requested 512, maskable, 192, 180, 167, 152, and ICO files.
   - Also replace the currently referenced 32px favicon, 192/512 favicon variants, and Apple touch icon so no browser or device can retain a different icon.
   - Keep the manifest icon entries pointed at the unified files, with correct dimensions and purposes.
   - Confirm both `manifest.webmanifest` and any `site.webmanifest` present use only these assets; do not create a duplicate unused manifest.

3. **Generate and update Android icons**
   - Generate the missing Capacitor Android project using the existing app configuration.
   - Replace `ic_launcher.png`, `ic_launcher_round.png`, and `ic_launcher_foreground.png` in mdpi, hdpi, xhdpi, xxhdpi, and xxxhdpi with correctly scaled versions of the same artwork.
   - Ensure adaptive icon configuration does not introduce another foreground, colour, or logo.
   - Keep the Android display name as **AJBN Connect**.

4. **Update the iOS app icon**
   - Replace the iOS asset catalogue PNG with a correctly scaled 1024×1024 version of the same artwork.
   - Keep the iOS display name as **AJBN Connect**.

5. **Verify and release**
   - Check generated image dimensions and compare the artwork across all targets.
   - Build the web app and sync the Capacitor Android/iOS projects.
   - Verify the manifest and visible browser icon references, then publish the updated app.
   - The native iOS App Store archive still requires Apple signing on a Mac; publishing here updates the live web/PWA release and native project sources.

## Technical details
- Preserve the artwork’s opaque dark-blue background and white **AJBN CONNECT** lettering exactly.
- Use platform-required dimensions while maintaining the original square aspect ratio.
- Avoid maroon artwork and any icon reading **Asian Jewish Business Network**.
- Do not change unrelated branding, page content, permissions, or app behaviour.
