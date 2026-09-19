DROP POLICY "Users insert own profile" ON public.profiles;

CREATE POLICY "Users insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id
  AND (
    has_role(auth.uid(), 'super_admin'::app_role)
    OR (
      is_approved IS NOT TRUE
      AND membership_tier = 'free'
      AND deleted_at IS NULL
    )
  )
);