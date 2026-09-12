# Uniform member and company profiles

## Goal
Make directory navigation predictable while keeping login-enabled members distinct from imported company-only listings. Reuse the current private messaging and 1-to-1 tracking systems.

## Directory
- Make each login-enabled member card keyboard-accessible and clickable to `/member/$memberId`, with a pointer cursor and clear hover/focus feedback.
- Keep actions inside the card independent: stop card navigation before booking, requesting a 1-to-1, messaging, opening LinkedIn, or using safety controls.
- Show `Book 1-2-1` when the member has a valid booking link; open it in a new tab and record the click in `one_to_ones`.
- Otherwise show `Request 1-2-1`, which opens the existing private conversation flow without sending an automatic message.
- Make unlinked company cards clickable to `/company/$companyId`; retain only Website and LinkedIn actions on those cards.
- When a company is linked to a login-enabled owner, enhance its card with the same Book/Request, Message, and Reveal Contact actions, routed through that owner.

## Member profile
- Add a protected, no-index `/member/$memberId` page available only to approved members.
- Load only approved login-enabled members; show a clear not-found state for unknown, blocked, or non-member IDs.
- Display the member’s existing directory/profile details and exactly three consistent actions:
  1. `Book 1-2-1` or `Request 1-2-1`
  2. `Message`
  3. `Reveal Contact`
- Reuse messaging activation and `startOrGetConversation`; do not build a second chat system.
- Reveal email and phone only after an explicit click, and only to signed-in approved members. Do not include contact details in the normal directory response or initial page markup.
- Keep block/report controls available on the member profile.

## Company profile
- Add a protected, no-index `/company/$companyId` page showing company name, industry, city, tier, description, website, and LinkedIn.
- For an unlinked company, hide member-only actions and show: “This is a company listing. Connect via website.”
- For a linked company, retain the company information and add the same three actions using its linked owner account.

## Board messaging consistency
- Extract one shared “open private chat” flow used by Directory, Member Profile, linked Company Profile, and the Board.
- Preserve the Board’s existing contextual starter message for `I can help`, then navigate to the same `/messages/$conversationId` thread.
- Preserve messaging activation checks, errors, and blocked-member enforcement already provided by the current chat system.

## Admin company linking
- Add a `Link company` selector to each `/admin/members` row without removing existing search, filters, approvals, promotion, password reset, or Quiet Hours actions.
- Let a super admin link or unlink one corporate listing to a login-enabled member in one action.
- Show the currently linked company and prevent one company from being assigned to multiple users.
- Record link and unlink actions in `admin_audit_log`.

## Database and security
- Add nullable `corporate_members.owner_user_id`, referencing `public.profiles(id)` rather than the managed authentication schema.
- Add a uniqueness rule for non-null owners so one login maps to at most one corporate listing.
- Preserve existing grants and RLS; only approved members may read directory/profile data, while only super admins may change company ownership.
- Add narrow authenticated server functions/RPCs for member detail and explicit contact reveal. Contact output will be limited to email and phone and excluded from list queries.
- Extend company reads with safe owner capability fields needed for linked actions, without exposing owner contact details.

## Verification
- Check unlinked company cards and profiles expose only Website/LinkedIn and the company-listing banner.
- Link a company from `/admin/members`, confirm its directory/profile actions upgrade, then unlink it and confirm they revert.
- Confirm member cards navigate from mouse and keyboard while nested actions do not trigger card navigation.
- Confirm booking opens a new tab and logs one click; missing booking links open chat via `Request 1-2-1`.
- Confirm Message, Request, and Board `I can help` all open the existing conversation thread.
- Confirm Reveal Contact is explicit, approved-member-only, and displays available email/phone without leaking them into list responses.
- Verify desktop and mobile layouts, relevant route metadata, build health, and runtime console/network errors.

## Technical details
- Use TanStack dynamic routes with `to="/member/$memberId"` / `to="/company/$companyId"` and typed `params`; never interpolate route strings for router links.
- Use existing design-system buttons, badges, dialogs, toasts, and semantic color tokens; add no libraries.
- Keep all new pages behind the existing authentication and approved-role checks and mark them `noindex, nofollow`.
