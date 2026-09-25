# Fix iOS blank screen on launch (Build 8 Info.plist)

## Problem
`ios/App/App/Info.plist` was stripped of the keys that tell iOS how to build the main window:
- No `UIApplicationSceneManifest` (so `SceneDelegate.swift` is never connected)
- No `UIMainStoryboardFile` (so `Main.storyboard` — which exists and contains the Capacitor bridge view controller — is never loaded)
- `AppDelegate.didFinishLaunchingWithOptions` returns true without creating a window, and `SceneDelegate.scene(_:willConnectTo:)` is empty

Result: tapping the app icon can show a blank/black screen instead of the AJBN Connect login/directory.

Also missing: `UISupportedInterfaceOrientations` / `~ipad`, `UIViewControllerBasedStatusBarAppearance`, `CFBundleDevelopmentRegion`.

## Fix (one file: ios/App/App/Info.plist)
Add back the standard Capacitor keys, keeping the existing hardcoded bundle id/version (uk.co.ajbn.connect / 21 / 1.0.3) and all existing usage-description keys untouched:

```xml
<key>UIMainStoryboardFile</key><string>Main</string>
<key>UIApplicationSceneManifest</key>
<dict>
  <key>UIApplicationSupportsMultipleScenes</key><false/>
  <key>UISceneConfigurations</key>
  <dict>
    <key>UIWindowSceneSessionRoleApplication</key>
    <array>
      <dict>
        <key>UISceneConfigurationName</key><string>Default Configuration</string>
        <key>UISceneDelegateClassName</key><string>$(PRODUCT_MODULE_NAME).SceneDelegate</string>
        <key>UISceneStoryboardFile</key><string>Main</string>
      </dict>
    </array>
  </dict>
</dict>
<key>UISupportedInterfaceOrientations</key>
<array><string>UIInterfaceOrientationPortrait</string></array>
<key>UISupportedInterfaceOrientations~ipad</key>
<array>
  <string>UIInterfaceOrientationPortrait</string>
  <string>UIInterfaceOrientationPortraitUpsideDown</string>
  <string>UIInterfaceOrientationLandscapeLeft</string>
  <string>UIInterfaceOrientationLandscapeRight</string>
</array>
<key>UIViewControllerBasedStatusBarAppearance</key><true/>
<key>CFBundleDevelopmentRegion</key><string>en</string>
```

No Swift changes needed — with the scene manifest restored, iOS instantiates `SceneDelegate` and loads `Main.storyboard` (the Capacitor bridge view) automatically.

## Not changed
- Bundle id, version 21 / 1.0.3, all permission strings — untouched
- No web code, no database, no other iOS files
- Version is NOT bumped — this restores Build 8's intended config; bump only if you want to submit a new build to App Store Connect

## Verification
- `plutil`-style XML validation of the edited plist
- Confirm Main.storyboard + SceneDelegate wiring matches the restored keys
