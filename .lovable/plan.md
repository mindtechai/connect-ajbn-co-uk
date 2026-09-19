# Fix the profile page: keep typed values, save to your AJBN account

## The problem

Your profile screen at `/profile` (which opens Profile settings) currently reloads its
values whenever the app re-checks your sign-in — which happens when you switch fields,
switch app/tab, or when iOS brings the app back to the foreground. That reload wipes
anything you had typed or pasted but not yet saved, which is why LinkedIn, Bio, Phone
and Professional tags vanish.

Separately, this screen is still saving only into the browser's own storage on the
device (a leftover from the demo build), so values never reach your AJBN account and
never appear on another device.

## What changes

1. **Nothing is wiped while you edit.** The values are loaded once when the page opens
   and then held until you save or cancel. Field changes, scrolling, switching tabs or
   apps, and the background sign-in check no longer touch what you typed.

2. **Explicit Edit / Save / Cancel.**
   - The page opens in read-only mode showing your saved details.
   - "Edit profile" unlocks the fields.
   - "Save changes" writes to your AJBN account; the page returns to read-only.
   - "Cancel" restores the last saved values and locks the fields again.
   - There is no auto-save when you leave a field.

3. **Saved to your AJBN account.** First name, last name, title, industry, phone,
   LinkedIn, bio and professional tags save to your member record, so a reload on web
   or iOS shows them, and they feed the directory and your member profile.

4. **Professional tags** stay a proper list held in the edit state: adding or removing
   a tag never resets the list, and pending tags only persist when you press Save.

5. **Company name stays where approval happens.** Company is shown read-only here with
   the existing link to the Member Portal, because company name changes need admin
   approval and must not be writable from this screen.

6. **Profile photo** keeps its current on-device behaviour in this change, so photo
   handling is untouched.

## Technical notes

- `src/pages/Profile.tsx`: replace the localStorage load/save with one Supabase read of
  `profiles` (`first_name, last_name, title, industry, phone, linkedin, bio, tags,
  company, email`) guarded by a `loadedRef` so it runs once per mount, keyed on
  `user?.id` only — never on the `user` object identity that `onAuthStateChange`
  replaces on focus/token refresh.
- Local state: `saved` (last persisted snapshot) + `form` (draft) + `editing` boolean.
  Cancel = `setForm(saved)`; Save = `supabase.from("profiles").update(...)` scoped to
  `.eq("id", user.id)` (existing self-update RLS policy; `protect_profile_approved_fields`
  already blocks privileged columns), then `setSaved(form)` and exit edit mode.
- LinkedIn is normalised to `https://…` on save, as today.
- All inputs remain controlled with `value=` + `onChange`, `disabled={!editing}`.
- No new query invalidation is introduced; no other hook refetches this form.
- No schema, RLS, auth or Build 8 changes.

## Verification

Signed in as an approved member at iOS width (390px) and desktop: paste LinkedIn →
scroll → paste Bio → add a professional tag → type Phone → confirm all four are still
present → Save → reload → all four still present. Then publish to
https://connect.ajbn.co.uk.
