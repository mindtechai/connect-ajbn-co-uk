# Fix TestFlight mobile navigation, sponsors, and sign-in placement

## Scope
Address only the three reported Build 8 issues while preserving authentication, member access rules, and existing page content.

## Changes

1. **Referral Rewards ribbon**
   - Rework the mobile ribbon so it sits above the 70px bottom navigation and safe-area inset instead of covering it.
   - Add an accessible X control without nesting a button inside the ribbon link.
   - On dismissal, save `referralRibbonDismissed = "true"` plus a dismissal timestamp; keep it hidden for seven days, then allow it to return.
   - Apply mobile bottom content clearance so the ribbon and navigation do not cover the end of a page.
   - Keep the behavior available for signed-in and signed-out visitors, while preserving the existing route exclusions.

2. **Sponsor logos**
   - Replace the two remote image URLs on Sponsors & Partners with the existing same-origin SCW Legal and Tradelend asset files already used elsewhere in AJBN Connect.
   - Resolve them through the existing asset helper so they load in the website, PWA, and iPhone wrapper without external-domain or filename-case dependence.
   - Keep sponsor names, roles, links, and layout unchanged.

3. **Sign-in placement and hamburger contents**
   - Make the mobile hamburger list exactly: Home, Directory, Messages, Services, Impact Lions, Profile, Privacy, Account Deletion.
   - Remove Sign In, Member Sign In, Login, registration, and other account actions from the hamburger.
   - Show a compact **Sign In** button in the top-right header for signed-out users only; retain the existing signed-in header state without showing Sign In.
   - On the home page, show **Already a member? Sign In** directly above **Apply for Membership** for signed-out users only.

## Verification
- Test at 390px signed out: ribbon is above navigation space, X dismisses it, dismissal survives reload, drawer has only the requested links, and both new Sign In placements are visible.
- Test at 390px signed in: bottom navigation remains tappable and no Sign In control appears.
- Open Sponsors & Partners and confirm both logos load from same-origin assets with no failed image requests.
- Check keyboard labels/focus, route navigation, TypeScript, formatting, and the latest preview build result.
