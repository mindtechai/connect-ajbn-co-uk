INSERT INTO public.user_roles (user_id, role)
SELECT id, 'super_admin'::public.app_role FROM auth.users WHERE email = 'support@ajbn.co.uk'
ON CONFLICT DO NOTHING;

DELETE FROM public.user_roles
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'support@ajbn.co.uk')
  AND role = 'prospective_member'::public.app_role;

INSERT INTO public.admin_audit_log (actor_id, action, target_type, target_id, details)
SELECT '61b57723-a563-4448-b4e0-e22e2b30588c', 'grant_super_admin', 'user', u.id,
       jsonb_build_object('email', 'support@ajbn.co.uk', 'reason', 'Support admin account creation (approved plan)')
FROM auth.users u WHERE u.email = 'support@ajbn.co.uk';