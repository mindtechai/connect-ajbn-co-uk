import { Link } from "react-router-dom";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";

export function BrandLink({ full = false }: { full?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Asian Jewish Business Network — Home">
      <img src={ajbnLogo.url} alt="AJBN" className="h-8 w-8 rounded-md object-cover shadow-sm" />
      <span className="font-display text-sm sm:text-base font-bold text-primary whitespace-nowrap">
        {full ? "Asian Jewish Business Network" : "AJBN"}
      </span>
    </Link>
  );
}