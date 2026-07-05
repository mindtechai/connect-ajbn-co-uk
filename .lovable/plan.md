Update the rewards tier descriptions in `src/pages/ReferralRewards.tsx` so they reflect the new flagship-event stand, magazine advert, and lead-sponsor discount benefits.

Changes to make:

1. In the `Ambassador` tier (3–5 referrals / year), replace the last perk:
   - FROM: `Reserved seat at flagship dinners`
   - TO: `Reserved stand at cost at the annual flagship event held in October every year with a free half a page advert in the annual magazine`

2. In the `Chair's Circle` tier (6+ referrals / year), replace the last perk and add one more:
   - FROM: `Named on the annual Chair's Circle honour roll`
   - TO: `Free reserved stand at the annual flagship event held in October with full page advert in the annual magazine published in the year of 5+ referrals completed`
   - ADD: `50% discount to become the lead sponsor for the new year — normal price £6,000 + VAT reduced to £3,000`

3. Run `bun run build` to confirm the edit compiles cleanly.

No other files need to change.