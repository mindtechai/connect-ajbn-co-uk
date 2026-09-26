# Fix the 5 bugs — one update

## Already done (last update, no work needed)
- **Bug 1 Welcome back:** greeting uses first name from the profile or sign-up details, else "Member". Never an ID or referral code. Pending members see their real name plus "Your application is pending approval". The sign-up trigger stays untouched (locked rule).
- **Bug 2 Forgot password:** the "Forgot password? Create new" link under New Password in Settings is live. It sends a reset link and shows "Reset link sent".
- **Bug 3 Apple Review picture:** no code change, as you asked.

## Bugs 4 + 5: Directory service filter
Checked live: every business already has a list of services, not just one industry. For example GB Bank has Property Finance, Commercial Finance and Banking. So the fix is about the tags on each business, not a new column.
- **Why "Bridging" shows only RYSE:** ATZ Finance is tagged Commercial, Property and Asset Finance, but not Bridging Finance. The filter works. The tag is missing.
- **Fix:** add Bridging Finance to ATZ Finance's tags and to its linked member. For other firms I only change tags you confirm, so no one gets a wrong service.
- **No word search in bios:** I won't add the ILIKE search across bio and description text. A bank whose bio says "we work with accountants" would then show under Tax Accountants, which is the exact bug you reported. Matching on tags keeps results accurate.
- **Filter + search = AND:** check that the service filter and the search box narrow results together. Fix it if they don't.
- **Show all services on cards:** each Directory card (member and company) shows every service as chips, e.g. "Bridging Finance • Property Finance • Asset Finance".
- **Update tags by spreadsheet (Bug 4 step 4):** in /admin/companies, add an "Import services" CSV upload with columns company name and services, comma-separated. It updates each firm's tags and its linked members, so you won't need a new request for each firm. Unknown service names are rejected and listed back to you.

## Test
- Bridging filter shows RYSE and ATZ.
- Tax Accounting shows accountants and no banks.
- Test a sample CSV import.
- Check at iPhone width.
- Publish.

## Technical notes
- No schema change. Uses the existing `services_list text[]` on `corporate_members` and `profiles`.
- CSV import: a super_admin-only server function. It matches rows by `normalize_company_name` and checks names against `service_taxonomy`.
