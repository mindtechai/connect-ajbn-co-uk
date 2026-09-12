# Two new member features

## 1. Book 1-2-1

- Members add their own booking link (Calendly or similar) in the Member Portal, saved instantly like phone and bio.
- On every member card in the Member Directory, a "Book 1-2-1" button appears when that member has a booking link. It opens their link in a new tab and records the click.
- The dashboard gains a card: "1-2-1s this month: X" — the number of Book 1-2-1 clicks the signed-in member made since the start of the current month.
- Clicks are stored in a new table `one_to_ones` (who clicked, who they booked with, when). Each member can only see and add their own rows; admins can see all.

## 2. Needs & Offers board at /board

- New member-only page with two tabs: NEED and OFFER.
- Post form: Title, Description, Category (Property / Finance / Legal / Tax / Other). Every post expires automatically 7 days after posting.
- Cards show title, description, category, poster name/company, and time left. Category filter dropdown, matching the directory's style.
- "I can help" button on other members' posts starts (or reuses) a private conversation with the poster, sends an opening message referencing the post, and takes the user to that chat thread.
- Own posts show a delete option instead of "I can help".
- Board is reachable from the dashboard quick-nav grid and from the mobile tab bar area (dashboard link + direct route).

## Technical notes

- Migration adds:
  - `profiles.calendly_url` (text, member-editable, no approval needed) and recreates `member_directory_list()` with the extra column so the directory can show the button.
  - `one_to_ones` (`requester_id`, `target_id`, `clicked_at`) with GRANTs, RLS: insert/select own; super admins select all.
  - `board_posts` (`author_id`, `kind` need/offer, `title`, `description`, `category`, `expires_at` default now()+7 days) with GRANTs, RLS: approved members read non-expired posts; authors insert/update/delete their own; `updated_at` trigger.
- Frontend: new `src/pages/Board.tsx` + `src/routes/board.tsx` (wrapped in `RequireAuth`, `noindex`), reusing existing Tabs, Card, Select, Input, Textarea, Badge, Button components and the existing `start_or_get_conversation` messaging helper. No new libraries.
- Dashboard counter reads `one_to_ones` with a count query scoped to the current month.
