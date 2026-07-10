
## Added Value Services — Implementation Plan

### 1. Database (Supabase migration)

Create `public.service_enquiries`:

- `id uuid pk default gen_random_uuid()`
- `created_at timestamptz default now()`
- `user_id uuid null` (references `auth.users`, nullable for public submissions)
- `name text not null`
- `email text not null`
- `phone text`
- `service_type text not null`
- `message text`

Grants + RLS:
- `GRANT INSERT ON public.service_enquiries TO anon, authenticated;`
- `GRANT SELECT ON public.service_enquiries TO authenticated;` (filtered by admin policy)
- `GRANT ALL ON public.service_enquiries TO service_role;`
- Enable RLS.
- Policy: `insert` allowed for `anon` + `authenticated` (WITH CHECK true; if authenticated, `user_id` must equal `auth.uid()` or be null).
- Policy: `select` only for `public.has_role(auth.uid(),'super_admin')`.

### 2. Routing & Navigation

- Add `/services` route in `src/App.tsx` (public, no `RequireAuth`).
- `src/components/Navbar.tsx`: add "Services" link (desktop + mobile) with a `Briefcase` lucide icon adjacent to existing public links.
- Authenticated sidebar: add a "Services" entry linking to `/services` in the dashboard/member sidebar (locate current sidebar component used by Dashboard; likely `src/pages/Dashboard.tsx` or its nav). Use `Briefcase` icon.

### 3. New Files

- `src/pages/Services.tsx` — public page: Navbar + hero ("Added Value Services", dark navy + gold gradient) + 4-card grid + Footer.
- `src/components/services/ServiceCard.tsx` — reusable card (title, tagline, description, CTA button) styled dark w/ gold accent border/hover.
- `src/components/services/ServiceEnquiryDialog.tsx` — single shared shadcn `Dialog` containing form (Name, Email, Phone, Message), hidden `service_type`; pre-fills Name/Email from `useAuth` + profile when logged in; validates with `zod`; inserts into `service_enquiries`; success toast "Thank you — our team will be in touch within 24 hours"; closes modal.

### 4. Service Cards Data

Array in `Services.tsx` with 4 entries exactly as specified:
1. Capital & Deal Matching → "Submit a Deal"
2. Professional Advisory Connect → "Connect with an Advisor"
3. Referral Incentives Marketplace → "Enquire About Rewards"
4. Member-Exclusive Tech Builds → "Request Tech Consultation"

Grid: `grid md:grid-cols-2 gap-6` inside container.

### 5. Design

- Reuse existing tokens: dark navy background section, gold gradient title (`text-gradient-gold`), card `bg-card/60` with `border-gold/30`, gold hover ring. No new global styles.
- Icons per card (lucide): `Handshake`, `Scale`, `Gift`, `Code2`.

### 6. Form behavior

- One dialog instance in `Services.tsx`, state `{ open, serviceType }`.
- Card button → `setState({ open: true, serviceType: card.title })`.
- On submit: `supabase.from('service_enquiries').insert({ user_id: user?.id ?? null, name, email, phone, service_type, message })`.
- Toast via `sonner`.
- Zod validation: name 1–100, email valid ≤255, phone optional ≤30, message ≤2000.

### 7. Out of scope

- No email notification to admins (can be added later).
- No admin UI to view enquiries yet (data reachable via existing admin tooling); mention as optional follow-up.

### Technical notes

- Types regenerate after migration approval; write page/dialog code after migration runs.
- No changes to unrelated components/styles.
