DROP POLICY IF EXISTS "Anyone can view flagship exhibitors" ON public.flagship_exhibitors;
CREATE POLICY "View exhibitors of visible companies"
ON public.flagship_exhibitors FOR SELECT TO anon, authenticated
USING (EXISTS (SELECT 1 FROM public.corporate_members c WHERE c.id = flagship_exhibitors.company_id));