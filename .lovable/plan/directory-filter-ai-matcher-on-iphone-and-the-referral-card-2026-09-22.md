# Directory filter, AI Matcher on iPhone, and the referral card

## What I checked first (before changing anything)

The upload says the service list is empty. It is not — the live data shows:

- 40 approved service names, all active (your 25 plus the extras we added so nothing was left uncategorised).
- All 108 business listings carry service tags.
- The search index on service tags already exists.

So the Directory picker does show services, it is already multi-select with chips and a "N matches for N filters" count, and the AI Matcher's dropdown is already fed from the same approved list. Parts 1 and 2 of your note are already done and need no database change. Only member profiles are thinly tagged (1 of 11), which is expected — members get tags from their company listing.

What is genuinely worth fixing is Parts 3 and 4.

## 1. Find Matches button on iPhone

- The button becomes a sticky bar pinned above the bottom tab bar, clear of the iPhone home area, so it is always reachable.
- Tapping into the "Tell us more" box scrolls the form up smoothly and leaves room, so the keyboard never covers the button.
- Works unchanged on desktop.

## 2. No more endless spinner

- Matches are found from the tags first, which is instant.
- The AI is only used to rank them, and it now gets a strict time limit. If it is slow, you still get your matches with a small note: "Showing direct matches".
- The button text moves through "Finding…" then "Almost there…", so it never sits on a blank spinner.

## 3. Referral Opportunity card

The bottom card is replaced with your Option 1 wording exactly:

Title: Referral Opportunity

"Every great connection starts with trust. If you've worked with someone exceptional — who delivers, follows through, and represents our values — invite them in."

"Help us build London's most trusted business network, where quality introductions create real growth for everyone."

It shows on every result, on a light card that reads well at 375px wide, and the old "services to Asian business community in London" line is gone.

## Technical notes

- `src/pages/AiMatcher.tsx`: submit button moved into a `sticky bottom-0` bar with `pb-[calc(env(safe-area-inset-bottom)+80px)] md:static`, textarea `onFocus` → `scrollIntoView({ behavior: "smooth", block: "center" })`; staged busy label via a timer; static Referral Opportunity card replaces `result.referrals` rendering.
- `src/lib/ai-matcher.functions.ts`: wrap the AI ranking call in an 8s `AbortSignal.timeout`; on timeout/failure return the deterministic shortlist with `degraded: true` on `MatchResult`; stop returning AI-written `referrals` for display (field kept optional so nothing breaks).
- No migration: taxonomy rows, `services_list` tags and the GIN index all already exist; `handle_new_user`, referral codes and membership tiers untouched.
- iOS/`ios` Build 8 files untouched. Verify with `bunx tsgo --noEmit`, the build log, and a Playwright pass at iPhone width (390px) plus 1280x1800 with a minted session for an approved account.
