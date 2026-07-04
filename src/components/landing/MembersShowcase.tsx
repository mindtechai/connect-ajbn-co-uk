import { ScrollReveal } from "@/components/ScrollReveal";
import { ExternalLink } from "lucide-react";

type Member = { name: string; occupation: string; website: string };

const members: Member[] = [
  { name: "Barclays Private Bank", occupation: "Private Bank & Wealth Management", website: "https://home.barclays/" },
  { name: "HSBC", occupation: "Banking", website: "https://www.hsbc.com/" },
  { name: "Investec", occupation: "Private, Corporate & Investment Banking", website: "https://www.investec.com/en_gb.html" },
  { name: "Allica Bank", occupation: "Banking", website: "https://www.allica.bank/" },
  { name: "GB Bank", occupation: "Property Finance & Personal Savings", website: "https://www.gbbank.co.uk/" },
  { name: "BDO", occupation: "Accountancy & Advisory", website: "https://www.bdo.co.uk/en-gb/home" },
  { name: "Cooper Parry", occupation: "Tax — Capital Allowances", website: "https://linktr.ee/cooperparry" },
  { name: "BKL", occupation: "Chartered Accountants & Tax Advisers", website: "https://www.bkl.co.uk/" },
  { name: "Lubbock Fine", occupation: "Accountants", website: "https://www.lubbockfine.co.uk/" },
  { name: "Gravita", occupation: "Accountants", website: "https://www.gravita.com/" },
  { name: "Lawrence Grant", occupation: "Chartered Accountants", website: "https://www.lawrencegrant.co.uk/" },
  { name: "Barnett Waddingham", occupation: "Risk, Pensions, Investment & Insurance", website: "https://www.barnett-waddingham.co.uk/" },
  { name: "FRP Advisory", occupation: "Restructuring & Business Recovery", website: "https://www.frpadvisory.com/" },
  { name: "Begbies Traynor", occupation: "Business Recovery & Advisory", website: "https://www.begbies-traynorgroup.com/" },
  { name: "Devonshires", occupation: "Law Firm", website: "https://www.devonshires.com/" },
  { name: "DKLM", occupation: "Law Firm", website: "https://www.dklm.co.uk/" },
  { name: "Laytons", occupation: "Law Firm", website: "https://www.laytons.com/" },
  { name: "Manak Solicitors", occupation: "Law Firm", website: "https://manaksolicitors.co.uk/" },
  { name: "Jury O'Shea", occupation: "Law Firm", website: "https://www.juryoshea.com/" },
  { name: "ADBH Advisory", occupation: "Immigration Legal Services", website: "https://adbhadvisory.com/" },
  { name: "LDN Finance", occupation: "Financial Services", website: "https://ldnfinance.co.uk/" },
  { name: "Azure Wealth", occupation: "Financial Advisors", website: "https://azurewealth.co.uk/" },
  { name: "Exante", occupation: "Multi-Asset Financial Services", website: "https://exante.eu/uk/company/" },
  { name: "Inflow Finance", occupation: "Property Finance", website: "https://inflowfinance.com/" },
  { name: "Inspired Lending", occupation: "Property Finance", website: "https://inspiredlending.co.uk/" },
  { name: "Forum Insurance", occupation: "Insurance Brokers", website: "https://www.foruminsurance.com/" },
  { name: "Bridge Insurance", occupation: "Insurance", website: "https://www.bridgeinsurance.com/" },
  { name: "Heath Crawford", occupation: "Insurance", website: "https://www.heathcrawford.co.uk/" },
  { name: "ActionCOACH", occupation: "Business Coaching", website: "https://www.actioncoach.co.uk/coaches/falguni-desai" },
  { name: "AtomCTO", occupation: "IT Services & Consulting", website: "https://atomcto.com/" },
  { name: "MVI", occupation: "Media, Publishing & PR", website: "https://www.wearemvi.com/" },
  { name: "DOHR", occupation: "HR Specialists", website: "https://dohr.co.uk/" },
];

function cleanHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function MembersShowcase() {
  return (
    <section id="members" className="py-24 bg-muted/40">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        <ScrollReveal>
          <p className="text-sm tracking-widest uppercase text-teal font-medium mb-3 text-center">
            Our Members
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-4">
            A cross-sector network of trusted professionals
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto mb-14">
            AJBN brings together senior figures from finance, property, legal, tech, marketing
            and beyond. Below is a sample of the corporate members powering our network.
          </p>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {members.map((m, i) => (
            <ScrollReveal key={m.name} delay={Math.min(i, 8) * 30}>
              <a
                href={m.website}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-start justify-between gap-3 bg-card border rounded-lg p-4 hover:border-primary/40 hover:shadow-sm transition-all h-full"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                    {m.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{m.occupation}</p>
                  <p className="text-[11px] text-muted-foreground/70 mt-1 truncate">{cleanHost(m.website)}</p>
                </div>
                <ExternalLink
                  size={14}
                  className="text-muted-foreground/60 group-hover:text-primary shrink-0 mt-0.5"
                  aria-hidden="true"
                />
              </a>
            </ScrollReveal>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-10">
          Sample of AJBN corporate members. Full directory available to active members after sign-in.
        </p>
      </div>
    </section>
  );
}