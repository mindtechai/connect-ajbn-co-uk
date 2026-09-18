import { ArrowLeft } from "lucide-react";
import { assetUrl } from "@/lib/asset";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";
import impactLionsLogo from "@/assets/impact-lions-logo.png.asset.json";

export function PublicHeader() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[800px] items-center justify-between px-4 py-3 md:py-4">
        <a
          href="/"
          className="flex items-center gap-4 rounded-md outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Asian Jewish Business Network — Home"
        >
          <img
            src={assetUrl(ajbnLogo)}
            alt=""
            aria-hidden="true"
            className="h-8 w-8 rounded-md object-cover sm:h-12 sm:w-12"
          />
          <span
            className="font-display text-lg font-bold sm:text-xl"
            style={{ color: "#164164" }}
          >
            AJBN
          </span>
          <img
            src={assetUrl(impactLionsLogo)}
            alt="AJBN Impact Lions Club"
            className="h-8 w-8 object-contain sm:h-12 sm:w-12"
          />
        </a>

        <a
          href="/"
          className="flex items-center gap-1.5 rounded-md text-sm font-medium text-slate-600 outline-hidden hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Back to Home"
        >
          <span className="text-slate-400" aria-hidden="true">/</span>
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Home</span>
        </a>
      </div>
    </header>
  );
}
