GRANT SELECT ON public.corporate_members TO authenticated;
GRANT ALL ON public.corporate_members TO service_role;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'ajbn_member'
FROM auth.users
WHERE email IN ('salil@proactiveconsultancy.co.uk', 'zeus@ajbn.co.uk')
ON CONFLICT (user_id, role) DO NOTHING;