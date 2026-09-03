REVOKE ALL ON FUNCTION public.is_block_between(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.enforce_message_block() FROM PUBLIC, anon, authenticated;