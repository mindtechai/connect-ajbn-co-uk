# Quiet Hours

## Goal
Add an optional Quiet Hours setting for signed-in members. When enabled, it applies every Friday from 6:00 PM until Saturday at 10:00 PM in UK local time, including automatic GMT/BST changes.

## Member experience
- Add a **Quiet Hours** switch in Settings.
- Show the note: **“Inspired by Shabbat — time to rest & recharge.”**
- Explain the active schedule and that email remains unaffected.
- Save the preference to the member’s account so it follows them across devices.
- While the window is active, show **“In Quiet Hours”** beside the member’s own account controls and on their member-directory profile.
- Outside that window, show no Quiet Hours status.

## Notification behaviour
- Mute the in-app notification bell during the active window by suppressing its unread badge and live alert updates.
- Keep received notifications stored and visible in the notification list, so nothing is lost and members can review them during or after Quiet Hours.
- Resume the unread badge and normal live updates automatically at Saturday 10:00 PM UK time.
- Do not mute email. Legally required account and security communications remain unchanged.

## Technical details
- Add a `quiet_hours_enabled` boolean preference to member profiles, defaulting to off.
- Preserve the current profile access rules and extend the authenticated member-directory function to return only the Quiet Hours preference needed for the status badge.
- Add a shared UK-time utility using `Europe/London` to calculate whether the current time falls inside the Friday–Saturday window.
- Update Settings, the account navigation, the notification bell, and authenticated member cards using existing controls and design styles.
- Keep the settings and directory pages protected and excluded from indexing.

## Verification
- Verify saving the switch persists after reload.
- Test active and inactive UK-time boundaries, including Friday 6:00 PM and Saturday 10:00 PM.
- Confirm the own-account and directory statuses agree.
- Confirm the bell is muted without deleting notifications and resumes afterward.
- Confirm email preference and delivery behaviour are unchanged.
- Check desktop and mobile layouts, then run the relevant build and interaction checks.
