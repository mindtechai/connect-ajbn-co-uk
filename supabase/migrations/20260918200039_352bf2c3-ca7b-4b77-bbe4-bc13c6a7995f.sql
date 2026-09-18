DROP POLICY IF EXISTS "Approved members read live board posts" ON public.board_posts;
DROP POLICY IF EXISTS "Approved members create their own board posts" ON public.board_posts;

CREATE POLICY "Approved members read live board posts"
ON public.board_posts FOR SELECT TO authenticated
USING (((expires_at > now()) OR (auth.uid() = author_id)) AND public.is_approved_member(auth.uid()));

CREATE POLICY "Approved members create their own board posts"
ON public.board_posts FOR INSERT TO authenticated
WITH CHECK ((auth.uid() = author_id) AND public.is_approved_member(auth.uid()));