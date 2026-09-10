REVOKE EXECUTE ON FUNCTION public.protect_profile_approved_fields() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Members can upload own logo" ON storage.objects;
CREATE POLICY "Members can upload own logo"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'member-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Members can update own logo" ON storage.objects;
CREATE POLICY "Members can update own logo"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'member-logos' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'member-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Members can delete own logo" ON storage.objects;
CREATE POLICY "Members can delete own logo"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'member-logos' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Members can read member logos" ON storage.objects;
CREATE POLICY "Members can read member logos"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'member-logos'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_approved_member(auth.uid())
      OR public.has_role(auth.uid(), 'super_admin')
    )
  );