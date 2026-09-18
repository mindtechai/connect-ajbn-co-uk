import { ArrowLeft } from "lucide-react";
import { assetUrl } from "@/lib/asset";
import ajbnLogo from "@/assets/ajbn-logo.jpg.asset.json";
import impactLionsLogo from "@/assets/impact-lions-logo.png.asset.json";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#e5e7eb] bg-white">
      <div className="mx-auto flex h-[72px] max-w-[800px] items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <a
            href="/"
            title="AJBN Connect Home"
            className="rounded-md outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <img
              src={assetUrl(ajbnLogo)}
              alt="AJBN"
              className="h-8 w-auto rounded-md bg-white object-contain sm:h-12"
            />
          </a>
          <a
            href="/"
            title="AJBN Connect Home"
            className="font-display text-lg font-bold outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-xl"
            style={{ color: "#164164" }}
          >
            AJBN
          </a>
          <a
            href="/lions"
            title="AJBN Impact Lions Club District 105A"
            className="rounded-full outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <img
              src={assetUrl(impactLionsLogo)}
              alt="AJBN Impact Lions Club"
              className="h-8 w-auto rounded-full bg-white object-contain p-0.5 sm:h-12"
            />
          </a>
        </div>


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
