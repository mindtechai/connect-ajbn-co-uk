import { useCallback, useEffect, useState } from "react";

// Demo mode: messaging is always active locally, no backend calls.
const KEY = "ajbn_demo_messaging_active";

export function useMessagingProfile() {
  const [isActive, setIsActive] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const v = localStorage.getItem(KEY);
    if (v === null) {
      localStorage.setItem(KEY, "1");
      return true;
    }
    return v === "1";
  });

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(KEY) === null) {
      localStorage.setItem(KEY, "1");
    }
  }, []);

  const activate = useCallback(async () => {
    localStorage.setItem(KEY, "1");
    setIsActive(true);
  }, []);

  const refresh = useCallback(async () => {}, []);

  return { isActive, loading: false, activate, refresh };
}