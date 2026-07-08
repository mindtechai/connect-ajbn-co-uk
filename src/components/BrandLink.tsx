import { Link } from "react-router-dom";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";
import impactLionsLogo from "@/assets/impact-lions-logo.png.asset.json";
import { assetUrl } from "@/lib/asset";

export function BrandLink({ full = false }: { full?: boolean }) {
  const label = "Asian Jewish Business Network";
  return (
    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
      <Link
        to="/"
        aria-label={`${label} — Home`}
        className="flex items-center gap-2 sm:gap-3 shrink-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        <img
          src={assetUrl(ajbnLogo)}
          alt=""
          aria-hidden="true"
          className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-lg object-cover shadow-md ring-2 ring-gold/60 shrink-0"
        />
        <span className="font-display text-base sm:text-lg lg:text-xl font-bold text-primary whitespace-nowrap">
          {full ? label : "AJBN"}
        </span>
      </Link>
      <Link
        to="/lions"
        aria-label="AJBN Impact Lions Club page"
        className="shrink-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        <img
          src={assetUrl(impactLionsLogo)}
          alt="AJBN Impact Lions Club"
          className="h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 object-contain shrink-0 hover:opacity-80 transition-opacity"
        />
      </Link>
    </div>
  );
}