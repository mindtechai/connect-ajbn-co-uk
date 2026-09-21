import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * The approved list of service names (AJBN service taxonomy). Everything that
 * filters or matches on service uses this list, so typos and duplicate wording
 * can never reach the UI.
 */
export function useServiceTaxonomy() {
  const [services, setServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("service_taxonomy")
        .select("name,sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (!active) return;
      setServices((data ?? []).map((row) => row.name as string));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  return { services, loading };
}
