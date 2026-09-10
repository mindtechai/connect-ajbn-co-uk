import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Reads the signed-in member's messaging profile from the backend.
 * Activation is persisted server-side so chat works on every device.
 */
export function useMessagingProfile() {
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const uid = sessionData.session?.user?.id;
    if (!uid) {
      setIsActive(false);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("messaging_profiles")
      .select("is_active")
      .eq("user_id", uid)
      .maybeSingle();
    if (error) console.error("messaging_profiles read failed", error);
    setIsActive(Boolean(data?.is_active));
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activate = useCallback(async () => {
    const { error } = await supabase.rpc("activate_messaging");
    if (error) throw error;
    setIsActive(true);
    await refresh();
  }, [refresh]);

  return { isActive, loading, activate, refresh };
}
