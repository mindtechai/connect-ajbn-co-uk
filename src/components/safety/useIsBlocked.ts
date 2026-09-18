import { useEffect, useState } from "react";
import { isBlocked, syncBlocked } from "@/lib/moderation";

/**
 * Reactive "is this member blocked by me?" check. Keeps UGC surfaces in sync
 * with the member's block list so blocked content disappears immediately.
 */
export function useIsBlocked(memberId?: string | null): boolean {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const sync = () => setBlocked(isBlocked(memberId ?? undefined));
    sync();
    void syncBlocked();
    window.addEventListener("ajbn-moderation-changed", sync);
    return () => window.removeEventListener("ajbn-moderation-changed", sync);
  }, [memberId]);

  return blocked;
}
