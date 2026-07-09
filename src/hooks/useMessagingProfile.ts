import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useMessagingProfile() {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setIsActive(false); setLoading(false); return; }
    const { data } = await supabase
      .from("messaging_profiles")
      .select("is_active")
      .eq("user_id", user.id)
      .maybeSingle();
    setIsActive(!!data?.is_active);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const activate = useCallback(async () => {
    const { error } = await (supabase as any).rpc("activate_messaging");
    if (error) throw error;
    await refresh();
  }, [refresh]);

  return { isActive: !!isActive, loading, activate, refresh };
}