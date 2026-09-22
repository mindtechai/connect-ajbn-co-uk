# Merged company cards, a 3-rep limit per company, and an admin Companies screen

## What I checked against the live data first

Four of the six items are already live and need no further work:

- **Services list** — 40 approved service names are active (your 25 plus the extras added so nothing was left uncategorised). The Directory picker is already populated and already multi-select with chips and a "N matches for N filters" count.
- **Service tags** — all 108 business listings carry tags, and the fast search index exists. ATZ Finance is tagged Commercial Finance, Property Finance and Asset Finance.
- **iPhone button** — Find Matches already sits in a sticky bar clear of the tab bar and home area, and the form scrolls up when you tap the notes box.
- **Buffering and referral wording** — matches come from tags first, the ranking step has an 8-second limit with a "Showing direct matches" note, the button moves through "Finding…" then "Almost there…", and the bottom card already carries your Option 1 wording exactly.

Two items are genuinely outstanding, and the live data confirms both.

## 1. One card per company (the duplicate ATZ)

Right now the same business can appear twice: once as the company listing "ATZ Finance" and once as the person "Nelesh Kavia — ATZ Finance Ltd". Both carry the same three service tags.

- People and company listings are joined by business name, so one business produces one card.
- Where a person and a listing match, you see a merged card: the person's name as the title, the business name and their role underneath, and the business's own description — not "tagged with…".
- That card carries both **Message** and **View listing**.
- A business with nobody signed up shows as a company card labelled "No representative yet", with **View listing** only.
- Asset Finance therefore returns one ATZ card, and Tax Accounting returns unique firms with no repeats.

## 2. Maximum 3 representatives per company

Today a person's business is only free text, so nobody is formally linked to a listing and no limit can be enforced. To make "3 reps max" real:

- Each member record gains a proper link to one company listing, filled in automatically where the business name already matches.
- The database refuses a fourth link to the same company.
- On sign-up, if the business already has three people, the member sees: "ATZ has 3 reps max (Nelesh + 2). Contact admin."
- A new admin **Companies** screen lists every business with a Reps badge — 0/3 grey, 1/3 green, 2/3 amber, 3/3 red FULL (ATZ shows 1/3).
- Opening a business shows its three slots, the people in them, and **Remove** and **Make primary** for each.

## Technical notes

- One migration: add `profiles.company_id uuid references public.corporate_members(id) on delete set null` with an index; backfill via `normalize_company_name(profiles.company) = normalize_company_name(corporate_members.company_name)`; add a `BEFORE INSERT OR UPDATE` trigger function (SECURITY DEFINER, `search_path = public, pg_catalog`) that raises when the target company already has 3 linked, non-deleted profiles; keep `corporate_members.owner_user_id` as the primary rep marker. No change to `handle_new_user`, `referral_code`, `membership_tier`, approval logic, or the company-visibility policy. GRANTs unchanged (existing table).
- `member_directory_list()` and `member_profile_detail()` gain `company_id` so the client can merge. Re-grant to `authenticated`/`service_role`, revoke from PUBLIC/anon, as with the previous rebuilds.
- `src/lib/ai-matcher.functions.ts`: after building member and company candidates, dedupe on `company_id ?? normalized company name`; a merged candidate keeps the member identity plus `company_id`, and uses the listing's `short_bio` for the reason when the ranking step returns nothing useful. Keep the 8s timeout, deterministic shortlist, rate limit and logging as they are.
- `src/pages/AiMatcher.tsx`: card renders title/subtitle/bio from the merged candidate and shows Message + View listing together, or "No representative yet" for unclaimed listings.
- New `src/components/admin/CompaniesAdmin.tsx` + `src/routes/admin/companies.tsx` (super-admin only, added to the admin sidebar/mobile nav) with the counts query, Reps badges, and a detail panel with Remove / Make primary through a new `src/lib/admin-companies.functions.ts` (full-scope admins only, writes to `admin_audit_log`).
- `src/pages/Register.tsx`: check the linked company's rep count before submit and show the "3 reps max" message.
- iOS/`ios` and Build 8 files untouched. Verify with `bunx tsgo --noEmit`, the build log, row counts, and a Playwright pass at 390px and 1280x1800 with a minted session for an approved account.
