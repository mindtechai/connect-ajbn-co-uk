DROP POLICY IF EXISTS "Members can block others" ON public.member_blocks;

CREATE POLICY "Members can block others"
ON public.member_blocks
FOR INSERT
TO authenticated
WITH CHECK (
  blocker_id = auth.uid()
  AND blocked_id <> auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = member_blocks.blocked_id
      AND p.deleted_at IS NULL
  )
);