## Goal
Add a landing-page teaser block for Direct Member Messaging that visually mirrors the existing "Members Referral Rewards" section (`ReferralRewardsSection.tsx`), with a CTA that smoothly scrolls to the existing `DirectMessagingPublicSection` (the 3-step guide).

## Changes

### 1. New component: `src/components/landing/DirectMessagingTeaserSection.tsx`
Mirrors `ReferralRewardsSection` structure exactly:
- `<section id="direct-messaging-teaser" className="py-24 bg-background">`
- Same header treatment: gold uppercase eyebrow "Direct Member Messaging", `text-3xl md:text-4xl font-display` heading "Connect securely. Stay private.", muted body copy: "Connect securely 1-on-1 with property developers, finance providers, and corporate members. Your private contact details remain 100% masked."
- 3-card grid (matching `md:grid-cols-3 gap-6`, `rounded-xl border bg-card p-6`, gold chip icon `w-10 h-10 rounded-lg bg-gold/10`):
  - `MessageCircle` — "1-on-1 Secure Chat" — routed through the app, no phone/email exposed.
  - `ShieldCheck` — "Contact Details Masked" — email + mobile stay 100% private.
  - `Sparkles` — "One-Tap Activation" — activate your inbox from the dashboard in a single click.
- CTA button (matches `variant="default" size="lg"` + `ArrowRight`): "Learn More & Activate". On click, smooth-scrolls to `#direct-messaging` (the id already on `DirectMessagingPublicSection`) via `document.getElementById(...).scrollIntoView({ behavior: 'smooth' })`.

### 2. `src/pages/Index.tsx`
Insert `<DirectMessagingTeaserSection />` immediately before `<ReferralRewardsSection />` so the two matching blocks sit adjacent and balance each other visually.

### 3. `src/components/landing/DirectMessagingPublicSection.tsx` (verify only)
Confirm it has `id="direct-messaging"` for the scroll target; add the id if missing.

## Notes
- Uses existing design tokens (`gold`, `bg-card`, `text-muted-foreground`) — no new colors.
- Purely presentational; no auth, backend, or messaging logic changes. Active messaging remains auth-gated in `/directory`.
