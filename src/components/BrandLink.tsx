import { Link } from "react-router-dom";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";
import impactLionsLogo from "@/assets/impact-lions-logo.png.asset.json";
import { assetUrl } from "@/lib/asset";

export function BrandLink({ full = false }: { full?: boolean }) {
  const label = "Asian Jewish Business Network";
  return (
    <Link
      to="/"
      aria-label={`${label} — Home`}
      className="flex items-center gap-2 sm:gap-3 shrink-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
    >
      {/* Logo is decorative; the link's accessible name is provided by aria-label + visible text. */}
      <img
        src={assetUrl(ajbnLogo)}
        alt=""
        aria-hidden="true"
        className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-lg object-cover shadow-md ring-2 ring-gold/60 shrink-0"
      />
      <span className="font-display text-base sm:text-lg lg:text-xl font-bold text-primary whitespace-nowrap">
        {full ? label : "AJBN"}
      </span>
      <img
        src={assetUrl(impactLionsLogo)}
        alt=""
        aria-hidden="true"
        className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 object-contain shrink-0"
      />
    </Link>
  );
}