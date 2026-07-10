import { ShieldCheck, Trophy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function MemberBadges({
  verifiedConnector,
  topAmbassador,
  size = 14,
}: {
  verifiedConnector?: boolean;
  topAmbassador?: boolean;
  size?: number;
}) {
  if (!verifiedConnector && !topAmbassador) return null;
  return (
    <span className="inline-flex items-center gap-1">
      {topAmbassador && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center justify-center rounded-full bg-gold/15 border border-gold/40 text-gold p-1" aria-label="Top Network Ambassador">
              <Trophy size={size} />
            </span>
          </TooltipTrigger>
          <TooltipContent>Top Network Ambassador — most member referrals</TooltipContent>
        </Tooltip>
      )}
      {verifiedConnector && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-flex items-center justify-center rounded-full bg-teal/15 border border-teal/40 text-teal p-1" aria-label="Verified Connector">
              <ShieldCheck size={size} />
            </span>
          </TooltipTrigger>
          <TooltipContent>Verified Connector — 5+ service enquiries logged</TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}