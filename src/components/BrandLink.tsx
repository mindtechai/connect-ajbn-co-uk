import { Link } from "react-router-dom";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";
import { assetUrl } from "@/lib/asset";

export function BrandLink({ full = false }: { full?: boolean }) {
  const label = "Asian Jewish Business Network";
  return (
    <Link
      to="/"
      aria-label={`${label} — Home`}
      className="flex items-center gap-2 shrink-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
    >
      {/* Logo is decorative; the link's accessible name is provided by aria-label + visible text. */}
      <img
        src={assetUrl(ajbnLogo)}
        alt=""
        aria-hidden="true"
        className="h-8 w-8 rounded-md object-cover shadow-sm"
      />
      <span className="font-display text-sm sm:text-base font-bold text-primary whitespace-nowrap">
        {full ? label : "AJBN"}
      </span>
    </Link>
  );
}