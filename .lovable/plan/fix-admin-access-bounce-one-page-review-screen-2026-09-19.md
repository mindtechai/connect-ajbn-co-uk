# Fix admin access bounce + one-page review screen

## What I checked first

- Your account (salil@proactiveconsultancy.co.uk) **does** have the super admin role in the database — no missing row.
- The access rules on the roles table already allow each person to read their own role, and admins to read all — nothing blocking there.

So the redirect isn't a permissions problem. It's a timing bug in the app.

## The real cause

When you sign in, the app records you as signed in **before** it has finished
looking up your role. During that gap the admin area sees "signed in, no admin
role" and bounces you to the dashboard. Opening `/admin/members?filter=pending`
directly, or straight after sign-in, hits that gap most often. Once roles have
loaded (e.g. after a manual refresh) it works — which matches what you saw.

## Fix

1. Track whether the role lookup has finished, separately from sign-in. The
   admin area shows "Loading…" until roles are known, and only then decides
   admin vs dashboard. No decision on incomplete data.
2. Do the role lookup immediately on sign-in instead of deferring it, and keep
   the intended destination (`/admin/members?filter=pending`) through sign-in.
3. If the role lookup itself fails (network/permission error), log it to the
   browser console and retry rather than silently treating you as non-admin.

## One-page review screen

`/admin` becomes a single review page containing, top to bottom:

- Counts: total members, pending approval, approved, blocked, sign-ups 24h/7d
- Pending approvals list with View / Approve / Reject inline
- Blocks
- Member reports
- Recent admin audit entries

Existing dedicated pages (`/admin/members`, `/admin/blocks`, `/admin/reports`,
`/admin/audit`) stay exactly as they are, so current links and the admin email
buttons keep working — the new page just removes the need to hop between them.

## Left untouched

New-member setup, referral codes, membership tiers, approval rules (no
auto-approval), the company visibility rule hiding the pending member's
company, and the directory's approved-and-not-deleted filter.

## Verification before publishing

- Sign in as salil@ and open `/admin/members?filter=pending` directly — must
  list the 6 pending members (Nelesh Kavia, Saal Pat TEST, Laura Bahar,
  DIEUDONNE AGWE, ae1043969@, natanellider@)
- `/admin` one-page review shows all five sections with live data
- `/directory` shows 5 members + 134 companies, ATZ Finance hidden
- Type check, whitespace check, production build, browser pass at 1280x1800
- Then publish to https://connect.ajbn.co.uk

## Technical notes

- `src/hooks/useAuth.tsx`: add `rolesLoaded` state, set on `fetchRoles`
  completion; fetch roles directly in `onAuthStateChange` (drop the
  `setTimeout(…, 0)` defer); log fetch errors.
- `src/components/RequireSuperAdmin.tsx`: hold the loading state while
  `user && !rolesLoaded`; reviewer scope and redirect behaviour unchanged.
- New `src/components/admin/ReviewOverview.tsx` composing the existing
  `AnalyticsOverview`, `MemberApprovals`, `BlocksAdmin`, `MemberReportsAdmin`
  and `AuditLog` sections; rendered as the default `/admin` content in
  `src/pages/Admin.tsx`.
- No schema, RLS, or trigger changes.
