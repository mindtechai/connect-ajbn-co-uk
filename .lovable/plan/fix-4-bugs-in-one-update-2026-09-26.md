# Fix 4 bugs in one update

## What I found in the live data
- Every account, including pending ones, already gets its member record the moment they sign up (15 accounts, 15 records). But 5 of them have no first name saved (for example natanellider@, munish.kjalota@, salil@ajbn.co.uk). The welcome line then falls back to the part of the email before the @, which is how codes like "762aweyi123" appear.
- The Directory service filter is tag-based, and no bank is tagged "Tax Accounting". Filtering by Tax Accounting on the Directory returns only the 10 accounting firms. The banks most likely come from the AI Matcher's ranking or from the free-text search. I'll reproduce it first and fix whichever one it is.
- The Apple Review account currently has **no** profile picture saved.

## Changes

**1. Welcome name (Dashboard + pending screen)**
- New shared helper for the name to show: first name + last name, then the name from Apple or Google sign-in, then "Member".
- It never falls back to the email prefix, ID or referral code.
- It's used for the Dashboard welcome, the header and the pending-approval screen. The pending screen reads "Welcome back, [Name]" with "Your application is pending approval" underneath.
- The sign-up setup step stays as it is, per your standing rule. Records are already created at sign-up, so no change is needed there.

**2. Forgot password in Settings**
- Under "New password" on the Change Password form, add a link: "Forgot password? Create new".
- It sends the standard reset email to the signed-in address, redirects to /reset-password and shows the toast "Reset link sent".
- The existing change-password form stays the same.

**3. Apple Review picture**
- No code change. The account has no picture yet.
- I'll sign in as apple-review@, upload a neutral AJBN-logo image through the normal profile screen, and confirm it shows. That tests the upload path end-to-end.

**4. Directory / Matcher "Tax Accountants" returning banks**
- Reproduce "tax accountants" and "banks" in both the Directory search box and the AI Matcher.
- Directory: when a service filter is set, the filter and the search box must both match (this already works). Search terms will match whole words in name, title, industry and services, so "accountants" can't match unrelated text.
- Matcher: keep the tag shortlist. Drop any AI-returned result outside that shortlist, so banks can never appear for Tax Accounting.
- Test: "tax accountants" shows only accountants, and "banks" shows only banks.

## Verify, then publish
Typecheck and build. Then run Playwright at 390px signed in as apple-review@ (dashboard name, picture, directory tests) and as a pending member (welcome line). Then publish. iOS files are not touched.
