# Reviewer privacy fix — hide contact actions from the Apple review account

## Problem

When signed in as the Apple review account (`apple-review@ajbn.co.uk`), a member profile such as `/member/[id]` still shows **Request 1-2-1**, **Message** and **Reveal Contact**. Reveal Contact exposes another member's email and phone, which breaks the privacy promise made for the App Store review.

## What changes for the reviewer account

- Member profile page: no Request 1-2-1, no Message, no Reveal Contact, no contact details anywhere on the page.
- Instead the profile shows two large, obvious buttons: **Block user** and **Report user**.
- A banner at the top of the profile reads: "Reviewer mode — moderation tools visible, contact details hidden for privacy."
- Directory cards and the company profile page: same treatment — action buttons removed, Block/Report kept.
- The reviewer keeps being sent straight to the Blocks moderation screen from the home page and the admin area, with the same banner (already working, left untouched).

## What stays exactly the same

Every ordinary member keeps Request 1-2-1, Message, Reveal Contact **and** Block/Report as today. Admin approvals, moderation, events, messaging and the current App Store build are untouched.

## Technical notes

- New shared hook `useReviewerMode()` (reads the signed-in email from `useAuth`, compares to `apple-review@ajbn.co.uk`) so the check lives in one place.
- `MemberActions.tsx`: when reviewer mode is on, render the Block/Report pair (reusing the existing report/block logic from `MemberSafetyMenu`) instead of the 1-2-1 / Message / Reveal Contact row; `revealContact()` also returns early as a second guard.
- `MemberProfile.tsx`: add the reviewer banner above the header; surface Block/Report as full-size buttons rather than the `•••` menu.
- `Directory.tsx` (member cards and company owner rows) and `CompanyProfile.tsx`: pass through the same reviewer-aware `MemberActions`, so no separate logic.
- Server-side enforcement: add `revealMemberContact` in a new `src/lib/member-contact.functions.ts` using `requireSupabaseAuth`; it resolves the caller's scope the same way `admin-reports.functions.ts` does and returns `{ email: null, phone: null }` for the reviewer, otherwise calls the existing `reveal_member_contact` RPC as the caller. `MemberActions` calls this server function instead of the RPC directly, so contact fields can never reach the reviewer's browser.
- No database migration, no RLS change, no new libraries.

## Verification

- `bunx tsgo --noEmit`, `git diff --check`, `bun run build`.
- Browser check: reviewer account on a member profile sees the banner plus Block/Report only and no contact dialog; an approved ordinary member still sees all four actions and can reveal contact.
- Publish to https://connect.ajbn.co.uk after the checks pass.
