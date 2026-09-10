GRANT SELECT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
GRANT SELECT, INSERT ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.messaging_profiles TO authenticated;
GRANT ALL ON public.messaging_profiles TO service_role;