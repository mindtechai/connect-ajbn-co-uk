# Hide pending members' companies from the directory, plus three audits

## What I confirmed first

- 11 sign-in accounts, 11 member records — every account has a record. The automatic record creation already fills first name, last name, company, referral code, membership tier and leaves approval off. It will not be touched.
- The 6 unapproved members are Nelesh Kavia (ATZ Finance Ltd), Saal Pat TEST, Laura Bahar, DIEUDONNE AGWE (The Cevero Group Ltd), ae1043969@, natanellider@. All keep their referral code and tier.
- Pending members never appeared in the Members list — that list requires an approved member role, and I have now also added an approval check as a safeguard.
- "ATZ Finance" appears under Companies because it is one of the 135 imported company listings. None of the 135 is linked to a member account yet.

## 1. Hide companies belonging to pending members

Rule: a company listing is hidden from the Companies tab when its name matches a member who is still awaiting approval (or whose account was removed), unless it is linked to an approved owner.

- ATZ Finance and The Cevero Group disappear from Companies now; the rest of the imported list (about 133) stays visible.
- Approving Nelesh brings ATZ Finance back automatically — no admin step.
- Admins keep seeing everything in the admin screens.

Names are matched loosely (case, spacing, and trailing Ltd / Limited / Ltd. ignored) so "ATZ Finance" matches "ATZ Finance Ltd".

## 2. Email and approval flow audit (report, only fix what is broken)

Checks: e-mail confirmation required before sign-in; new members always start unapproved and are sent to the pending screen instead of the directory; only a super admin can flip approval, and each approval/rejection is written to the audit trail; password reset goes through the standard reset e-mail and cannot bypass the approval check; removed accounts (deleted date set) are excluded everywhere.

One item already known: zeus@ajbn.co.uk has not confirmed its e-mail — reported, not changed.

## 3. Migration safety verification

Nothing about member records changes in this work, and I will confirm after the change that:

- accounts = 11 and member records = 11
- the same 6 pending rows still show their referral code, referred-by code, tier, company and name

## 4. Access-rule audit

Checks per area, reporting anything weaker than expected and fixing only what is genuinely open:

- Members: no access for signed-out visitors; a signed-in member can read their own record; approved members are visible through the vetted directory function; only super admins can change approval.
- Companies: readable by approved members only; unclaimed listings belonging to pending members hidden per the rule above.
- Blocks, reports, messages, conversations, 1-2-1 logs: each member sees only their own, plus super admins for moderation.
- Roles and audit trail: super admin only.

## 5. Testing (approved account only)

As agreed, no pending account will be signed in and no sign-in record will be modified.

Signed in as salil@proactiveconsultancy.co.uk:
- /directory Members shows none of the 6 pending people
- /directory Companies hides ATZ Finance and The Cevero Group
- /admin/members?filter=pending shows all 6

Pending side confirmed by rules and data only: pending count stays 6, a pending member can read only their own record.

Then publish to https://connect.ajbn.co.uk.

## Technical notes

- One migration only: replace `public.corporate_members` SELECT policy so a row is visible to approved members when `owner_user_id` is an approved, non-deleted member, OR no profile (approved or pending) matches the normalised company name, OR the caller is a super admin. Normalisation via an immutable helper stripping case/punctuation and a trailing `ltd|ltd.|limited`. No table, column, trigger, grant or `handle_new_user` change.
- Already applied earlier this session: `member_directory_list`, `referrers_directory`, `public_member_directory` now also require `is_approved AND deleted_at IS NULL`.
- Audits are read-only (`pg_policies`, function bodies, auth settings, `src/pages/Register.tsx`, `src/pages/Pending.tsx`, `src/lib/admin-members.functions.ts`, `src/pages/ForgotPassword.tsx`). Findings reported in chat; any fix beyond the policy above will be raised before applying.
- Verify with `bunx tsgo --noEmit`, the build log, row-count queries, and Playwright at 1280x1800 using a minted session for the approved account only.
