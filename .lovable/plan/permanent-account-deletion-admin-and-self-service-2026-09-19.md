# Permanent account deletion — admin and self-service

Two deletion paths, both permanently erasing the account. Nothing in `ios-ajbn/` is touched.

## 1. Admin: Delete Account in the Members Log

In `/admin/members`, each member row's 3-dot menu gains a **Delete Account** item (red), below the existing "Delete member" (which only hides a member). Visible only to full super admins, and never on your own row.

Clicking it opens a confirmation box:

> Delete DIEUDONNE BAHADOH AGWE (info@cevero.co.uk)?
> This permanently deletes their sign-in, profile, company listing, messages, deals and event records. This cannot be undone.
> Type DELETE to confirm.

The Confirm button stays disabled until DELETE is typed exactly. On success: toast "Member deleted", the list refreshes, and pending counts drop if the person was pending. Add New Member and Export CSV stay exactly as they are.

What gets erased: sign-in account, member record, their company listing, messages and conversations, logged deals, event RSVPs and interests, blocks, reports, notifications, referral/reward rows, and their own actions in the audit history. One audit entry is written under your name recording the deletion (action `admin_delete`) with the deleted person's name, email and company, so you keep a record of who removed whom.

## 2. Member: Delete My Account in Settings

Account settings (`/settings`) gains a red **Danger Zone** at the bottom with a **Delete My Account** button — the same component already on the profile page, so behaviour and wording stay consistent:

> Delete your AJBN Connect account? All data is removed and this cannot be undone.
> Type DELETE to confirm.

On confirm the account is erased, the person is signed out and returned to the home page. This is the screen to record for App Review — it is reachable in the iPhone app under Settings.

Self-deletion currently only removes the sign-in and member record; it will be extended to the same full erasure as the admin path (company listing, messages, deals, event records, etc.).

## Technical notes

- New server function `hardDeleteMember` in `src/lib/admin-members.functions.ts`: `requireSupabaseAuth` + full-scope `assertSuperAdmin`, rejects `memberId === context.userId`, loads name/email/company for the audit row first, writes the `admin_delete` audit entry before erasure, then deletes dependent rows via `supabaseAdmin` and finally `auth.admin.deleteUser`.
- Shared erasure helper in `src/lib/delete-account.server.ts` used by both paths: deletes `corporate_members` owned by the user, `messages` + `conversations`, `deal_logs`, `event_rsvps`, `event_interests`, `member_blocks`, `member_reports`, `one_to_ones`, `esg_contributions`, `notifications`, `notification_preferences`, `messaging_profiles`, `ai_matcher_requests`, `ai_reports`, `lion_applications`, `reward_deposits`, `unsubscribe_tokens`, `admin_audit_log` rows where the user is actor, `user_roles`, `profiles`, then the auth user. Null out `profiles.referred_by` references from other members so referral rows don't block deletion.
- `MemberManagement.tsx`: second `AlertDialog` with a typed-DELETE input, gated on `scope === "full"` and `m.id !== currentUserId`; on success calls the existing list refresh.
- `AccountSettings.tsx`: render `<DeleteAccountDialog />` in a Danger Zone section at the bottom.
- No schema or RLS migration required — deletion runs through the service-role admin client in server functions.
- Verify with `bunx tsgo --noEmit`, `git diff --check`, `bun run build`, then a Playwright pass at 1280×1800 as salil@proactiveconsultancy.co.uk confirming Delete Account appears on the DIEUDONNE and natanellider rows and Delete My Account appears in Settings. No test deletion will be performed against real accounts. Then publish to https://connect.ajbn.co.uk.
