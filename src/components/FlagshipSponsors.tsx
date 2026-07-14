import scwLogo from "@/assets/scw-legal.png.asset.json";
import tradelendLogo from "@/assets/tradelend.png.asset.json";
import ashVermaLogo from "@/assets/ash-verma.png.asset.json";
import riddleboxLogo from "@/assets/riddlebox.png.asset.json";

type Sponsor = {
  name: string;
  label: string;
  url: string;
  logo: string;
};

export const HEADLINE_SPONSORS: Sponsor[] = [
  {
    name: "Spector Constant & Williams",
    label: "Headline Sponsor — Law Firm",
    url: "https://www.scwlegal.co.uk",
    logo: scwLogo.url,
  },
  {
    name: "Tradelend",
    label: "Headline Sponsor — Property Finance",
    url: "https://www.tradelend.com",
    logo: tradelendLogo.url,
  },
];

export const FOOD_BEV_SPONSORS: Sponsor[] = [
  {
    name: "Ash Verma Consulting",
    label: "Food & Beverages Sponsor",
    url: "https://ashverma.com/",
    logo: ashVermaLogo.url,
  },
  {
    name: "Riddlebox",
    label: "Food & Beverages Sponsor",
    url: "https://riddlebox.co.uk/",
    logo: riddleboxLogo.url,
  },
];

function SponsorTile({ s, size = "md" }: { s: Sponsor; size?: "sm" | "md" }) {
  const h = size === "sm" ? "h-12" : "h-16";
  return (
    <a
      href={s.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col items-center justify-center gap-2 rounded-lg border border-border/60 bg-background p-3 hover:border-primary/40 hover:shadow-sm transition"
      aria-label={`${s.name} — ${s.label}`}
    >
      <img
        src={s.logo}
        alt={`${s.name} logo`}
        className={`${h} w-auto object-contain`}
        loading="lazy"
      />
      <span className="text-[11px] text-muted-foreground group-hover:text-primary text-center leading-tight">
        {s.name}
      </span>
    </a>
  );
}

export function FlagshipSponsors({ compact = false }: { compact?: boolean }) {
  const size = compact ? "sm" : "md";
  return (
    <div className="pt-4 border-t border-border/60 space-y-4">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide font-semibold text-primary">
          Headline Sponsors
        </p>
        <div className="grid grid-cols-2 gap-3">
          {HEADLINE_SPONSORS.map((s) => (
            <SponsorTile key={s.name} s={s} size={size} />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide font-semibold text-gold">
          Food &amp; Beverages Sponsors
        </p>
        <div className="grid grid-cols-2 gap-3">
          {FOOD_BEV_SPONSORS.map((s) => (
            <SponsorTile key={s.name} s={s} size={size} />
          ))}
        </div>
      </div>
    </div>
  );
}