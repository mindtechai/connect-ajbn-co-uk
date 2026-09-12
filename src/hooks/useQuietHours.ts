import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { isUkQuietHours } from "@/lib/quietHours";

export function useQuietHours() {
  const { user } = useAuth();
  const [enabled, setEnabled] = useState(false);
  const [activeNow, setActiveNow] = useState(false);

  useEffect(() => {
    if (!user) {
      setEnabled(false);
      return;
    }

    let live = true;
    void supabase
      .from("profiles")
      .select("quiet_hours_enabled")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (live) setEnabled(data?.quiet_hours_enabled ?? false);
      });

    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<{ enabled?: boolean }>).detail;
      if (typeof detail?.enabled === "boolean") setEnabled(detail.enabled);
    };
    window.addEventListener("ajbn-quiet-hours-changed", onChange);
    return () => {
      live = false;
      window.removeEventListener("ajbn-quiet-hours-changed", onChange);
    };
  }, [user?.id]);

  useEffect(() => {
    const refresh = () => setActiveNow(enabled && isUkQuietHours());
    refresh();
    const timer = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(timer);
  }, [enabled]);

  return { enabled, activeNow };
}