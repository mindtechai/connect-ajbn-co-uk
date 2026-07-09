## Direct Member Messaging – Onboarding & Activation

Introduce an in-app direct messaging system with a friendly activation flow, privacy-preserving routing, and directory integration.

### 1. Database (new schema)

- `messaging_profiles` — one row per activated user
  - `user_id` (PK, FK → auth.users)
  - `activated_at`, `is_active` (bool, default true)
  - RLS: user manages own row; other authenticated members can `SELECT` only `user_id` + `is_active` (via a safe RPC `is_messaging_active(uuid)`), never phone/email.
- `conversations`
  - `id`, `user_a`, `user_b` (sorted pair, unique), `last_message_at`
  - RLS: only the two participants can read.
- `messages`
  - `id`, `conversation_id`, `sender_id`, `body`, `read_at`, `created_at`
  - RLS: participants can `SELECT`; sender can `INSERT` (must be participant + both users have active messaging profiles). No updates/deletes from client.
- GRANTs to `authenticated` and `service_role` on all three; enable RLS; add `updated_at` trigger where relevant.
- Realtime enabled on `messages` and `conversations` for live inbox updates.

Privacy: no phone/email columns anywhere in messaging tables. Directory RPC (`member_directory_list`) already excludes email/phone — we'll extend it to also return `is_messaging_active` so cards can render the right CTA.

### 2. Dashboard onboarding card (`src/pages/Dashboard.tsx`)

Add a top-of-page branded card (navy gradient + teal accent, matches existing dashboard cards) above the Welcome/QuickNav grid:

- Icon: `MessageCircle` (lucide) in a teal chip
- Heading: "Connect Instantly"
- Body: "Direct Member Messaging is now live. Tap into the network to discuss capital, property, and business collaborations securely inside the app."
- Primary CTA button: **"Activate My Chat Inbox"** → calls `activate_messaging()` RPC (inserts row into `messaging_profiles` using `auth.uid()`), shows sonner success toast, then swaps the CTA to a secondary **"Open Inbox"** link (to `/messages`).
- If already activated, the card renders in a compact "✓ Chat inbox active — Open Inbox" state (dismissible via localStorage flag so it can be tucked away after first view).

No separate registration form — activation is one click using the current Supabase session.

### 3. Directory profile card integration (`src/pages/Directory.tsx`)

- Add a **Send Message** icon button (`Send` lucide icon) to every member card, next to the LinkedIn link.
- Behavior when clicked:
  - If **current user has activated** their inbox → navigate to `/messages/:otherUserId` (opens/creates conversation).
  - If **current user has NOT activated** → open a small `Dialog` modal:
    - Title: "Enable Direct Messaging"
    - Body: "Direct Messaging routes securely inside AJBN Connect — your phone number and email stay private. Activate your chat inbox to start a conversation with {Member Name}."
    - Buttons: "Activate & Open Chat" (calls activation RPC then navigates) / "Not now".
  - If the **target member has not activated** → button is disabled with tooltip "This member hasn't enabled messaging yet."

### 4. Messaging pages (minimum viable, matches AJBN layout)

- `/messages` — inbox list using `AppLayout` (navy header, existing nav). Shows conversations with counterpart name/company, last message snippet, unread badge.
- `/messages/:otherUserId` — thread view with message list and composer (textarea + Send). Uses Supabase Realtime channel scoped to the conversation.
- Both routes wrapped in `RequireAuth`; if the user isn't activated they see the same activation modal inline.

### 5. Privacy guardrails

- Zero client access to `profiles.email` / `profiles.phone` for messaging — messages only reference `user_id`; display names come from the existing `member_directory_list` RPC.
- Messaging RPCs are `SECURITY DEFINER` with `search_path = public` and check `has_role(auth.uid(), 'ajbn_member' | 'impact_lion' | 'super_admin')` so only approved members can send/receive.
- No email notifications for new messages in this iteration (keeps everything in-app as requested); a follow-up can add opt-in digests via the existing email queue.

### 6. Branding & layout consistency

- Reuse existing tokens (`bg-navy-gradient`, `text-primary`, `bg-teal/10`, gold accents where appropriate), `AppLayout`, `Navbar`, `Footer`.
- Add "Messages" entry to the dashboard Quick Nav grid and to `Navbar` (desktop + mobile), gated behind auth.
- Toasts via existing `sonner` setup.

### Files to add / edit

- **New migration**: `messaging_profiles`, `conversations`, `messages`, RLS, GRANTs, `activate_messaging()` + `start_or_get_conversation(uuid)` + updated `member_directory_list` returning `is_messaging_active`.
- **New**: `src/components/dashboard/MessagingOnboardingCard.tsx`, `src/pages/Messages.tsx` (inbox), `src/pages/MessageThread.tsx`, `src/components/messaging/ActivateMessagingDialog.tsx`, `src/hooks/useMessagingProfile.ts`.
- **Edit**: `src/pages/Dashboard.tsx` (mount card + quick-nav tile), `src/pages/Directory.tsx` (Send Message button + modal wiring), `src/components/Navbar.tsx` (Messages link), `src/App.tsx` (new routes).

### Out of scope (call out for follow-up)

- Attachments, group chats, message search, push notifications, message reporting/blocking UI (RLS already blocks non-participants; a report flow can be added later).
