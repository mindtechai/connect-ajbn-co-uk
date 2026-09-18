# Make Needs & Offers visible everywhere

Your offer "Offering pro bono tax planning review" is saved and live (expires 25 Sep). It simply has nowhere to appear except the Needs & Offers board page — member profiles and the dashboard never show posts, and there is no all-member feed. This adds those three views.

## 1. Member profile board

- On a member's profile page, below the bio, add a "Needs & Offers" section with two columns: Needs | Offers.
- Each entry: a Need/Offer badge, title, description, posted date, days left, and a "Contact to Discuss" button that opens (or reuses) a private chat with that member.
- Empty states: "No needs posted yet" / "No offers posted yet".
- Only live (non-expired) posts show.

## 2. New feed page: Browse all Needs & Offers

- New member-only page at `/needs-offers` listing every live post from all approved members, newest first.
- Filters: All | Needs | Offers, a category dropdown, and a search box ("Search tax planning, property...").
- Each card: member name, business/company, Need or Offer badge, title, description, time left, plus "View Profile" and "Message" buttons.
- Non-approved visitors see the existing pending-approval message instead of the feed.
- Added as a dashboard tile "Browse All Needs & Offers" next to the existing board link.

## 3. Dashboard sync

- Under the existing board quick link, add a "Your Needs & Offers" card listing the signed-in member's own live posts with Delete, plus the note: "Visible on your profile board and in the Needs & Offers feed for all members."
- Posting from the board page refreshes this list immediately.

## 4. App Store safeguards

- Every post card (profile, feed, board) gets a report flag so members can report a post; reports land in the existing member reports table for admin review.
- Disclaimer shown above the lists: "Needs and Offers are member-provided, not recommendations — conduct your own due diligence."
- The report flag stays hidden for the Apple review account, matching the existing review-account rule, so Build 8 review is unaffected.

## Notes on your list

- There is no separate `membership_status` / `approval_status` field and no pending queue for posts — posts go live instantly today and stay live for 7 days. Reading is already restricted to approved members and authors can delete their own, so no approval workflow is added.
- One access gap worth closing: the board's read/write rules check member roles only, so someone approved by flag but not yet carrying the member role can't see posts. I'll align them with the single approved-member check used everywhere else.

## Technical notes

- Migration: recreate the four `board_posts` policies to use `public.is_approved_member(auth.uid())` instead of the three `has_role` checks (same effect for current members, plus flag-approved ones). No schema change, no new table.
- Reuse `board_posts` everywhere; add a small shared `src/components/board/BoardPostCard.tsx` plus a `useBoardPosts` helper for the three surfaces, and reuse `openMemberConversation` + `sendMessage` for Contact/Message.
- Reporting reuses `src/lib/moderation.ts` (`member_reports`, context "profile"), including the post title in the details, so no new table or policy.
- New `src/pages/NeedsOffers.tsx` + `src/routes/needs-offers.tsx` wrapped in `RequireAuth` with `noindex, nofollow`; profile section added to `src/pages/MemberProfile.tsx`; dashboard card and tile in `src/pages/Dashboard.tsx`; review-account hiding via the existing `src/lib/ai-matcher-flag.ts` email list.
- No new libraries.
