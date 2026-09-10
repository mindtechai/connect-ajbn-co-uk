DROP POLICY IF EXISTS "Participants can send messages when both active" ON public.messages;
CREATE POLICY "Participants can send messages when both active"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = messages.conversation_id
      AND (c.user_a = auth.uid() OR c.user_b = auth.uid())
      AND public.is_messaging_active(c.user_a)
      AND public.is_messaging_active(c.user_b)
  )
);