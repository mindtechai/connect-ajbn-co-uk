# Clear pending experience for new members

## What I checked first

- Nelesh Kavia's account exists, is not yet approved, and sits in the prospective group.
- The Directory, Messages and Needs & Offers access rules are already open to approved members — not admins only. So nothing is broken in the access rules; Nelesh simply hasn't been approved yet.
- Approving a member already flips them to approved, gives them the member role, and can send the welcome email.
- Approval status is tracked by one approved flag plus the member's role. There is no second or third status field, so nothing extra needs setting.
- The app already refreshes a member's access when they return to the tab, so after approval they see full access on the next refresh without signing out.

So the real gap is the experience, not the permissions: a pending member lands on a dashboard that looks broken.

## What you'll get

### 1. A pending page

New page at `/pending`:

- AJBN logo, heading "Membership Pending Approval".
- "Thanks {first name}, your membership for {company} is under review by AJBN admin. You'll receive email confirmation once approved (usually within 24 hours)."
- A preview list of what unlocks: Members Directory, 1-2-1 Messaging, Referral Rewards, Needs & Offers, Events.
- Buttons: "Back to Home" and "Contact Admin" (emails admin@ajbn.co.uk).

After sign-up, and on any attempt to open a member-only area while unapproved, the member lands here instead of an empty screen. Already-approved members who visit `/pending` are sent to their dashboard.

### 2. Dashboard that explains itself

For an unapproved member on `/dashboard`:

- A prominent amber card at the top: "Your membership is awaiting approval — you'll get full access to the Directory, Messages and more once approved by admin", with a link to the pending page.
- Member-only tiles (Directory, Messages, Services, Referral Rewards, Needs & Offers, AI Matcher) stay visible but greyed with a padlock; tapping shows "Awaiting approval".
- Everything public stays as it is. Approved members see no change at all.

### 3. Approval always tells the member

When you approve someone in the admin members screen, the approval email to that member is sent every time (no longer dependent on a checkbox), saying they're approved and can sign in to access the Directory and 1-2-1 messaging.

### 4. No auto-approval

Every new sign-up — including companies already on your list — waits for your approval. Admin still gets the instant sign-up email plus the daily summary. When you send me an approved-email list later, I can add email-match auto-approval on top of this without changing anything else.

The Apple review account stays approved and keeps seeing the full dashboard, so Build 8 review is unaffected.

## Technical notes

- New `src/pages/Pending.tsx` + `src/routes/pending.tsx` (noindex head), signed-in only.
- `Register.tsx` post-signup navigation and `RequireAuth`-style member gates redirect unapproved users to `/pending`; approved users bounce from `/pending` to `/dashboard`. `isApprovedMember` from `useAuth` stays the single source of truth — no new columns, no schema change, no RLS change.
- `Dashboard.tsx`: read `isApprovedMember`; add the pending banner and a locked-tile wrapper (greyed + `Lock` icon + toast) around the member-only tiles. Presentation only.
- `src/lib/admin-members.functions.ts`: send the `member-welcome` email on every approval instead of only when `sendWelcome` is set; keep the audit entry.
- Verify with `bunx tsgo --noEmit`, the build log, and a signed-in browser check as the unapproved account (pending page + locked tiles) and as an approved account (unchanged dashboard).
