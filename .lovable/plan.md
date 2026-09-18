# Restore visible Report and Block actions for normal members

## What will change

- Update the shared member action area so normal members see **Request/Book 1-2-1**, **Message**, **Block user**, and **Report user** as visible controls on directory cards.
- Use a stable two-column layout where needed so all four controls fit cleanly on mobile and iOS without relying on the three-dot menu.
- On another member’s profile, show **Request/Book 1-2-1**, **Message**, **Reveal Contact**, **Block user**, and **Report user** visibly.
- Retain the existing three-dot safety menu on directory cards and profile headers as a duplicate route to Block and Report.
- Keep self-profile cards free of actions against the signed-in member.

## Reviewer privacy behavior

- Preserve the current `apple-review@ajbn.co.uk` moderation mode unchanged:
  - only large **Block user** and **Report user** controls;
  - the existing reviewer privacy banner;
  - no Request/Book, Message, Reveal Contact, phone, or email;
  - server-side contact suppression remains in force.

## Safety behavior

- Reuse the existing Block and Report controls and data functions rather than creating parallel logic.
- Confirm both visible controls still create `member_blocks` and `member_reports` records, update blocked-content visibility, and show the existing success/error feedback.
- Keep the duplicate three-dot controls synchronized with the visible buttons after blocking or unblocking.

## Verification and release

- Check normal-member directory cards and member profiles at desktop and mobile widths.
- Check reviewer directory/profile behavior and privacy banner.
- Exercise Report and Block from both directory and profile views.
- Run TypeScript, whitespace, and production build checks.
- Publish the verified update to `https://connect.ajbn.co.uk` without schema or Build 8 changes.

## Technical scope

- Frontend action composition and responsive layout only.
- No database schema, access-policy, authentication, email, Build 8, or dependency changes.
