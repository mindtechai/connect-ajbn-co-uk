# Apple compliance 4.0 / 4.2 / 5.1.1 — web update (bell only, no push service yet)

## 1. Sign in with Apple — both Hide My Email domains (4.0)
- Checked: nothing in the app blocks or allowlists relay addresses today, so @privaterelay.appleid.com and @private.icloud.com both already work.
- Add a small shared helper that recognises both domains (comment: `// Apple June 2026 - accept both relay domains`). Use it only to show "Private Apple email" on profiles and in the admin screens, never to block anyone.
- Apple and Google buttons stay the same: Apple black on top, Google white below, same size.

## 2. Announcements + in-app bell (4.2)
- Communications / Announcement panel: no changes to the existing layout. One checkbox goes in under Priority, above "Pin to top". It's ticked by default and reads "Notify all selected members (N recipients)", with the count updating as you pick segments.
- When ticked, publishing sends one in-app notification to every member in the selected segments. It uses the existing notifications table, so no current tables change.
- Member app: a bell icon at top right with an unread badge. It opens a Notification Center listing announcements. Tapping one marks it read and opens the announcement.
- Settings → Notifications: an "Announcement notifications" on/off toggle, using the existing preferences. When it's off, the member gets no bell alerts. Other settings stay as they are.
- Add a push_tokens table (user_id, token, platform, created_at) with owner-only access. It's ready for Build 37 but has nothing writing to it yet.
- Add code comments only for Build 37: Codemagic Push capability, background remote-notification, and the AppDelegate push handlers. No native changes and no OneSignal.

## 3. Photo wording (5.1.1)
- Profile photo upload text becomes "Profile photo in account settings".
- Privacy page: say profile photo only, with no mention of event photos.
- The iPhone camera wording ("event networking") lives in the iPhone settings file, which you'll fix in Codemagic. I won't touch it here, as you asked.

## Untouched
Report/Block, age gating, offline memberships (no in-app purchases), the iPhone project files, and existing tables.

## Test
- Publish "Annual Flagship Dinner 2026" with the box ticked and check the bell shows it as unread for a member.
- Turn the toggle off and check nothing new arrives.
- Check the login buttons at iPhone width, then publish.
