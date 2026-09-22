# Service picker on iPhone: bottom sheet, A-Z list, always-visible button

Two problems from your screenshots, both on the phone:

1. Tapping "Filter by Service" opens a small floating list that jumps up the screen, clips the top items and gets covered by the keyboard.
2. After picking three services, the button you need next sits behind the bottom tab bar.

## 1. Service picker becomes a bottom sheet on phones

- On screens under 768px, the picker slides up from the bottom instead of floating over the page: rounded top corners, about 60% of the screen height, with a fixed header ("Select services" + a search box) and the list scrolling underneath.
- The list starts at the very top every time it opens, with a little breathing room so the first item is never cut off, and it scrolls smoothly with its own scroll contained inside the sheet.
- The sheet sits above the keyboard, and the search box no longer drags the page upwards.
- Closed state reads "3 services selected", exactly as now.
- Desktop keeps today's dropdown unchanged.

## 2. Services listed A-Z

The list is shown in alphabetical order (Asset Finance, Audit, Bookkeeping, Bridging Finance, Chartered Accountants, ... Tax Accounting), so nothing appears in an order that looks like items are hidden above.

## 3. Buttons stay above the tab bar

- Directory: filtering stays automatic (no Apply needed), but a small sticky bar at the bottom shows the live count, e.g. "Show 10 matches", sitting clear of the Home/Directory/Messages/Services/Profile bar and the iPhone home area. Tapping it closes the sheet and returns to results.
- AI Matcher: the Find Matches button already sits in a sticky bar; its spacing is corrected to the same rule so it can never hide behind the tab bar or the keyboard.
- Both pages get extra bottom padding so the last card is fully scrollable into view.

## 4. Chips stay as they are

The selected chips with "x" and "Clear all" already work and are untouched.

## Technical notes

- `src/components/directory/ServiceFilter.tsx`: keep the existing Popover for `md+`; add a mobile branch using the existing `Drawer` (vaul) with `Command` inside. Sort `services` with `localeCompare` before render. List container: `max-h-[50dvh] overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] pt-2`, reset `scrollTop = 0` on open. Sticky header holds `CommandInput`. Sheet footer/content padded with `pb-[calc(env(safe-area-inset-bottom)+16px)]`. Branch on `useIsMobile()` from `src/hooks/use-mobile.tsx`.
- `src/hooks/useServiceTaxonomy.ts`: order by `name` ascending (keep `sort_order` fetch for compatibility) so every consumer gets A-Z.
- `src/pages/Directory.tsx`: wrapper gets `pb-[140px] md:pb-0`; add a mobile-only sticky summary bar `sticky bottom-0 z-40 pb-[calc(env(safe-area-inset-bottom)+80px)] md:hidden` showing `Show {shownTotal} matches`.
- `src/pages/AiMatcher.tsx`: keep the sticky bar, align padding with the same `calc(env(safe-area-inset-bottom)+80px)` rule.
- No database change, no migration, no query change (filter logic already uses OR across selected services). `ios/` and Build 8 untouched.
- Verify with `bunx tsgo --noEmit`, the build log, and Playwright at 375px and 1280x1800 using a minted admin session.
