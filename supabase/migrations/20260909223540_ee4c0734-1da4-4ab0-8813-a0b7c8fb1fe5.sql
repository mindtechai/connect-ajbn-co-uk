GRANT SELECT ON public.corporate_members TO authenticated;
GRANT ALL ON public.corporate_members TO service_role;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'ajbn_member'::app_role
FROM auth.users u
WHERE lower(u.email) IN ('salil@proactiveconsultancy.co.uk', 'zeus@ajbn.co.uk')
ON CONFLICT (user_id, role) DO NOTHING;