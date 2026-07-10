
# Unified PWA Enhancement Update

Bundles referral tracking, a live capital ticker, gamified badges, universal directory search, and a native-feel mobile shell into one shipment.

## 1. Database & Referral Tracking

Single migration adds:

- `profiles.referred_by uuid` (FK → `auth.users.id`, nullable, indexed).
- `profiles.tags text[]` (default `{}`) — free-form professional keywords (Barrister, Solicitor, Architect, Funder, IFA, etc.).
- `deal_logs` table: `user_id`, `counterparty_name` (text), `deal_type` (text), `amount_gbp` (numeric), `notes` (text), `created_at`.
  - RLS: authenticated users insert/select own rows; super_admin selects all; aggregate exposed via SECURITY DEFINER RPC.
  - GRANTs for `authenticated` and `service_role`.
- `service_enquiries.user_id` and `service_type` already exist — confirmed only, no change.
- RPCs (all `SECURITY DEFINER`, pinned `search_path=public`):
  - `referrers_directory()` → returns approved members `{id, first_name, last_name, company}` for the sign-up dropdown (safe subset, no email/phone).
  - `network_totals()` → `{total_deal_value_gbp, deal_count}` aggregate for the ticker.
  - `top_network_ambassador()` → the `user_id` with the most rows in `profiles.referred_by`.
  - Extend `member_directory_list()` to also return `tags text[]`, `enquiry_count int`, `is_verified_connector bool` (≥5 enquiries), `is_top_ambassador bool`.
- `handle_new_user()` trigger updated to also read `raw_user_meta_data->>'referred_by'` and store it in `profiles.referred_by` when it matches an approved profile id.

## 2. Registration — "Who referred you?"

`src/pages/Register.tsx` and the registration form on `src/pages/Login.tsx`:

- Load the referrer list from `referrers_directory()` on mount.
- Add a searchable Combobox (shadcn `Command` + `Popover`) labelled "Who referred you to AJBN? (optional)".
- Pass the selected member id through `supabase.auth.signUp({ options: { data: { referred_by } } })`.
- Retain the existing `referral_code` field as an alternate path.

## 3. Dashboard — Deal Ticker + Log Activity

- `src/components/dashboard/NetworkTicker.tsx`: fetches `network_totals()`, renders a prominent card at the top of `Dashboard.tsx` with animated GBP counter ("Total Capital & Deal Value Swapped in Network").
- `src/components/dashboard/LogActivityDialog.tsx`: shadcn Dialog with fields (deal type select, amount, counterparty, notes), 3-second submit cooldown, inserts into `deal_logs`, then refreshes the ticker and toasts success via sonner.
- Only approved members (ajbn_member/impact_lion/super_admin) see the Log Activity button.

## 4. Badges — Verified Connector & Top Network Ambassador

- `src/components/badges/MemberBadges.tsx`: renders `Verified Connector` (teal, ShieldCheck) when `enquiry_count ≥ 5` and `Top Network Ambassador` (gold, Trophy) when `is_top_ambassador`.
- Rendered inline on Directory cards and on the Profile page next to the name.
- Data comes from the extended `member_directory_list()` RPC — no extra round-trips.

## 5. Universal Directory Search & Tags

`src/pages/Directory.tsx`:

- Replace the split search/industry controls with one universal search bar.
- Filter matches across `first_name`, `last_name`, `company`, `title`, `industry`, `bio`, and `tags[]` (case-insensitive substring).
- Show `tags` as small badges under each card; keep the industry pill.
- Profile edit page gains a tag input (comma-separated, saved to `profiles.tags`), with the taxonomy list surfaced as clickable suggestions.

## 6. Native Mobile Shell

- `src/components/MobileTabBar.tsx`: fixed bottom tab bar (Home, Directory, Messages, Services, Profile), safe-area padding, 44×44 targets, only rendered `md:hidden` and only for authenticated users.
- Update `AppLayout.tsx`:
  - Header: keep `sticky top-0`, add `pt-[env(safe-area-inset-top)]`.
  - Main: add `pb-[calc(env(safe-area-inset-bottom)+64px)] md:pb-8` so content clears the tab bar.
  - Render `<MobileTabBar />` at the layout root.
- `src/components/OfflineFallback.tsx`: listens to `navigator.onLine` / `online`/`offline` events, renders a full-screen dark-navy card with WifiOff icon, message, and a Retry button that calls `window.location.reload()`. Mounted once in `App.tsx` so it overlays any route when offline.
- Confirm every mutation path (`ServiceEnquiryDialog`, `LogActivityDialog`, `MessageThread`, admin actions) uses sonner `toast.success`/`toast.error` — already the pattern; audit and align stragglers.

## Technical Notes

- One Supabase migration file covers schema + RPC changes; GRANTs added for every new object per project rules.
- No changes to `src/integrations/supabase/client.ts` or generated types (types regenerate after migration approval).
- Referrer dropdown uses `Command` from shadcn (`cmdk` already present via shadcn) — no new deps.
- Ticker animation uses a lightweight `requestAnimationFrame` counter, no chart lib.
- Tab bar hidden on `/login`, `/register`, `/reset-password`, and admin sub-routes to avoid duplicate nav.
- Offline component is client-only; safe with SSR-less Vite setup.

## Files Touched (approx.)

Migration: 1 new file.  
New: `NetworkTicker.tsx`, `LogActivityDialog.tsx`, `MemberBadges.tsx`, `MobileTabBar.tsx`, `OfflineFallback.tsx`, `ReferrerCombobox.tsx`.  
Modified: `Dashboard.tsx`, `Directory.tsx`, `Profile.tsx`, `Register.tsx`, `Login.tsx`, `AppLayout.tsx`, `App.tsx`.

## Out of Scope

- App Store packaging (Capacitor) — this update prepares the PWA shell; native wrapper is a separate step if desired.
- Historical backfill of `referred_by` from existing `referred_by_code` values.
