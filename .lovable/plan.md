## Goal

Make the Impact Lions logo visually match the AJBN logo's footprint across every shared layout, and fix the missing in-app landing page for the "Buy tickets" CTA on the AJBN Flagship Networking Day event.

## Findings from exploration

- Impact Lions logo lives in three shared components (`Navbar`, `BrandLink`, `Footer`) plus `Register.tsx`, and as hero art on `Lions.tsx` and `ImpactLionsSection.tsx`.
- The Impact Lions PNG has internal padding, so at equal pixel dimensions it visually reads smaller than the square AJBN JPG. To match footprint, its box needs to be roughly 30–40% larger than AJBN's.
- There is currently no in-app ticketing page. Both `EventsSection.tsx` and `Events.tsx` link "Buy tickets" straight out to `https://www.ajbn.co.uk/buy-tickets/`, which is why users never see AJBN branding on that view.

## Changes

### 1. Enlarge the Impact Lions logo (shared layouts)

Bump the Tailwind size classes so the visible logo mass matches AJBN. Keep `object-contain`, square width/height, and `shrink-0` to preserve aspect ratio and prevent nav breakage. Existing links and handlers are untouched.

- `src/components/Navbar.tsx` — Impact Lions img: `h-16 w-16 md:h-[4.5rem] md:w-[4.5rem] lg:h-20 lg:w-20`
- `src/components/BrandLink.tsx` — `h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20`
- `src/components/landing/Footer.tsx` — `h-16 w-16 md:h-20 md:w-20`
- `src/pages/Register.tsx` — bump Impact Lions img to match AJBN card sizing

Do not touch hero-scale usage in `Lions.tsx` and `ImpactLionsSection.tsx` (those are already large intentionally).

### 2. New in-app Flagship ticketing page

Create `src/pages/BuyTicketsFlagship.tsx`:

- Header block containing **both logos side-by-side at the enlarged size**.
  - AJBN logo → `Link to="/"` (back to landing).
  - Impact Lions logo → `Link to="/lions"` (its dedicated section/page), preserving the existing global behavior.
  - Each logo wrapped in a `Link` with `aria-label` describing the destination.
- Event summary (date, venue, description) sourced from the flagship entry already defined in `EventsSection.tsx`.
- Primary CTA button "Buy tickets on ajbn.co.uk" opening `https://www.ajbn.co.uk/buy-tickets/` in a new tab (keeps the real purchase flow intact).
- Secondary "Back to events" link to `/#events`.

### 3. Route + CTA rewiring

- `src/App.tsx`: register `<Route path="/tickets/flagship" element={<BuyTicketsFlagship />} />` (public — no auth wall, matches current external link behavior).
- `src/components/landing/EventsSection.tsx`: change the flagship event's `ctaHref` to `/tickets/flagship` and render it via `<Link>` (internal) instead of `<a target="_blank">`.
- `src/pages/Events.tsx`: change the flagship "Buy tickets" `<a>` to a `<Link to="/tickets/flagship">`.

### 4. Guardrails honored

- Aspect ratio: square Tailwind boxes + `object-contain`, no stretching.
- Layout: Navbar height (`h-20`) already accommodates a 5rem logo; `shrink-0` prevents flex overflow; button spacing unchanged.
- Existing Impact Lions link routing (`/lions`) is preserved everywhere except the new ticketing page, where the requirement itself specifies the same `/lions` target.

## Out of scope

No database, API, or auth changes. External purchase URL remains the source of truth for actual ticket sales.
