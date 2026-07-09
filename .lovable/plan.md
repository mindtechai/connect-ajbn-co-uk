## Plan: Public Direct Messaging Marketing Section

### Goal
Add a beautifully designed, purely static marketing section to the public landing page that explains the Direct Member Messaging feature, how to activate it, and routes visitors to the secure login path. The actual messaging buttons and chat threads remain auth-gated inside `/directory` as they are now.

### 1. New component

Create `src/components/landing/DirectMessagingPublicSection.tsx`.

**Content:**
- Eyebrow label: "Member Messaging" in teal uppercase tracking.
- Headline: "Secure, Private Peer-to-Peer Networking"
- Sub-headline: "Connect directly and securely with fellow members, property developers, and finance providers without exposing your personal contact details."
- 3-step visual guide:
  1. **Log In / Register** — Access your secure AJBN Connect portal.
  2. **Activate Your Inbox** — Tap the "Activate My Chat Inbox" card on your dashboard to securely opt-in (your phone number and email remain completely hidden).
  3. **Start Connecting** — Browse the verified Member Directory and click the "Send Message" icon to open an instant, secure chat.
- CTA: "Log In to Activate Messaging" → links to `/login` (and users can continue to `/directory` once authenticated).

**Design:**
- Use `bg-hero-pattern` (navy gradient) with `text-primary-foreground` for white text.
- Use teal accents (`text-teal`, `bg-teal/20`, `border-teal/30`) for icons, step numbers, and badges.
- Use `ScrollReveal` for entrance animations.
- Use Lucide icons: `MessageCircle`, `Lock`, `LogIn`, `Inbox`, `Send`, `ArrowRight`.
- Responsive layout: vertical stack on mobile, 3-column grid on md+.
- Step cards: translucent white background (`bg-white/10` or `bg-primary-foreground/5`) with border (`border-white/10`) and subtle blur to match the dark navy cards in the dashboard onboarding card.

### 2. Integration

Import `DirectMessagingPublicSection` into `src/pages/Index.tsx` and place it between `FeaturesSection` and `MembersShowcase`, so it immediately expands on the "Direct Messaging" feature already introduced in the features grid.

```text
Landing page order after change:
  HeroSection
  StatsSection
  AboutSection
  FeaturesSection
  DirectMessagingPublicSection  <-- NEW
  MembersShowcase
  EventsSection
  ImpactLionsSection
  ReferralRewardsSection
  CTASection
  Footer
```

### 3. Section anchor

Give the section `id="messaging"` so it can be linked directly from the footer or navbar later if needed.

### 4. CTA behaviour

The "Log In to Activate Messaging" button uses `variant="hero"` (white text on dark navy background) and routes to `/login`. It is purely static — no auth checks, no real chat buttons, no directory data on the public page.

### 5. Out of scope

- No database changes.
- No changes to `/directory`, `Messages`, `MessageThread`, or the activation dialog.
- No functional messaging UI on the public page.
- No new routes.