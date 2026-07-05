
-- Trigger-only helper: no client should call it directly
REVOKE EXECUTE ON FUNCTION public.ensure_unsubscribe_token() FROM PUBLIC, anon, authenticated;

-- Admin-only RPC (checks has_role internally); block anon
REVOKE EXECUTE ON FUNCTION public.checkin_rsvp(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.checkin_rsvp(uuid) TO authenticated;

-- Referral leaderboard is only shown on the authed dashboard
REVOKE EXECUTE ON FUNCTION public.referral_leaderboard(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.referral_leaderboard(integer) TO authenticated;

-- public_member_directory intentionally stays anon+authenticated (public landing page)
-- referral_code_exists intentionally stays anon+authenticated (signup form check)

-- Tighten avatars bucket read policy: only the owner can read their own file
DROP POLICY IF EXISTS "Members can read avatars" ON storage.objects;

CREATE POLICY "Users read own avatar"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);
