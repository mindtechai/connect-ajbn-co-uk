## Fixes to the Membership Referral Rewards ribbon

**File:** `src/components/ReferralSideRibbon.tsx`

1. **Text direction** — Currently the ribbon uses `[writing-mode:vertical-rl] rotate-180`, which makes the text read bottom-to-top. Change to `[writing-mode:vertical-rl]` only (drop the `rotate-180`) so it reads **top-to-bottom** on the right edge. Adjust the small `Gift` icon rotation to match the new orientation.

2. **Hide on homepage** — The homepage (`/`) already shows a vertical "Membership Referral Rewards" label built into the layout. Extend the existing hide rule so the ribbon does not render when `pathname === "/"` (in addition to the current `/referral-rewards` and `/admin` skips).

3. **Link target** — Confirm the `<Link to="/referral-rewards">` destination is unchanged and correctly routes to the Membership Referral Rewards page (the App route already exists).

## Verification

- Load `/` → no ribbon on the right (only the built-in vertical text).
- Load `/dashboard`, `/events`, `/lions`, `/directory` → ribbon visible on top-right, text reads top-to-bottom.
- Load `/referral-rewards` and `/admin/*` → no ribbon.
- Click the ribbon on any page it appears → navigates to `/referral-rewards`.
- Run the type check to confirm no build errors.
