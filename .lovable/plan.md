## Amendments

1. **Correct the AJBN Members' Evening date**
   - File: `src/components/landing/EventsSection.tsx`
   - Change the event ID and ISO date from `2026-07-10` to `2026-07-09`.
   - Keep the time label `6:30 PM – 9:00 PM` and all other details unchanged.

2. **Reposition the mobile Membership Referral Rewards tab**
   - File: `src/components/ReferralSideRibbon.tsx`
   - Current mobile compact tab sits at `top-20` (flush with the bottom of the fixed `h-20` navbar), with `z-40`, risking overlap with the header, top-mounted toasts (`z-100`), and any floating UI.
   - Change mobile positioning to clear the header and toast zones, e.g. `top-28` on small screens while keeping desktop `md:top-24` unchanged.
   - Preserve the compact vertical/horizontal tab styling (`writing-mode`, reduced font, Gift icon, `rounded-l-lg`).
   - Ensure the ribbon still shows only when the About or Events sections are in view on the homepage and remains hidden on Hero, Impact Lions, `/referral-rewards`, and `/admin`.

3. **Verify**
   - Typecheck the project.
   - Run Playwright checks on mobile (390px) and tablet to confirm the tab appears on About/Events, hides elsewhere, and does not visually sit on top of the navbar, toasts, or floating buttons.