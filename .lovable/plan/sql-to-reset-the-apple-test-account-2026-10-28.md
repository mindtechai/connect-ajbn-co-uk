# SQL to reset the Apple test account

Purpose: put the Apple review account back to a "fresh" state so the Complete Profile page shows empty Business Name and Service Category boxes again.

Note: the earlier version set `full_name`, but the profiles table has no such column. That line has been removed.

```sql
UPDATE public.profiles
SET first_name = 'Salil',
    last_name = 'Patankar',
    company = NULL,
    pending_company_name = NULL,
    company_name_status = NULL,
    primary_sector = NULL,
    is_approved = false
WHERE email = 'n7r77p9pzf@privaterelay.appleid.com';

SELECT first_name, last_name, email, company, pending_company_name,
       primary_sector, is_approved
FROM public.profiles
WHERE email = 'n7r77p9pzf@privaterelay.appleid.com';
```

Current state (already verified): Salil / Patankar, company "Salil Patankar ltd", sector "Construction", approved.

If you approve, I will run the reset on the database, confirm the row reads back empty, then you can sign in with Apple on https://connect.ajbn.co.uk/complete-profile to test.

Caution: `is_approved = false` will lock this account out of member-only pages until you approve it again in Admin. Tell me if you would rather keep it approved.
