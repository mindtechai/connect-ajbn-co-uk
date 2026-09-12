import { Moon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuietHours } from "@/hooks/useQuietHours";

export function QuietHoursStatus() {
  const { activeNow } = useQuietHours();
  if (!activeNow) return null;

  return (
    <Badge variant="secondary" className="gap-1 whitespace-nowrap" title="In Quiet Hours">
      <Moon size={12} aria-hidden="true" />
      <span className="hidden sm:inline">In Quiet Hours</span>
    </Badge>
  );
}