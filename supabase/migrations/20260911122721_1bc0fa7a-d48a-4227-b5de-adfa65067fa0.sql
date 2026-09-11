-- Allow a member to re-submit their own REJECTED application only.
CREATE POLICY "Users re-submit rejected application"
  ON public.lion_applications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'rejected')
  WITH CHECK (
    user_id = auth.uid()
    AND status = 'pending'
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND review_notes IS NULL
  );