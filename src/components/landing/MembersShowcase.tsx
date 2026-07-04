import { useEffect, useState } from "react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Building2, Crown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type DirectoryRow = {
  company: string;
  industry: string;
  member_count: number;
  has_lion: boolean;
};

// Curated fallback (also used to seed the display before real members exist).
const CURATED: DirectoryRow[] = [
  { company: "Barclays Private Bank", industry: "Private Bank & Wealth Management", member_count: 1, has_lion: false },
  { company: "HSBC", industry: "Banking", member_count: 1, has_lion: false },
  { company: "Investec", industry: "Private, Corporate & Investment Banking", member_count: 1, has_lion: false },
  { company: "Allica Bank", industry: "Banking", member_count: 1, has_lion: false },
  { company: "GB Bank", industry: "Property Finance & Personal Savings", member_count: 1, has_lion: false },
  { company: "BDO", industry: "Accountancy & Advisory", member_count: 1, has_lion: false },
  { company: "Cooper Parry", industry: "Tax — Capital Allowances", member_count: 1, has_lion: false },
  { company: "BKL", industry: "Chartered Accountants & Tax Advisers", member_count: 1, has_lion: false },
  { company: "Lubbock Fine", industry: "Accountants", member_count: 1, has_lion: false },
  { company: "Gravita", industry: "Accountants", member_count: 1, has_lion: false },
  { company: "Lawrence Grant", industry: "Chartered Accountants", member_count: 1, has_lion: false },
  { company: "Barnett Waddingham", industry: "Risk, Pensions, Investment & Insurance", member_count: 1, has_lion: false },
  { company: "FRP Advisory", industry: "Restructuring & Business Recovery", member_count: 1, has_lion: false },
  { company: "Begbies Traynor", industry: "Business Recovery & Advisory", member_count: 1, has_lion: false },
  { company: "Devonshires", industry: "Law Firm", member_count: 1, has_lion: false },
  { company: "DKLM", industry: "Law Firm", member_count: 1, has_lion: false },
  { company: "Laytons", industry: "Law Firm", member_count: 1, has_lion: false },
  { company: "Manak Solicitors", industry: "Law Firm", member_count: 1, has_lion: false },
  { company: "Jury O'Shea", industry: "Law Firm", member_count: 1, has_lion: false },
  { company: "ADBH Advisory", industry: "Immigration Legal Services", member_count: 1, has_lion: false },
  { company: "LDN Finance", industry: "Financial Services", member_count: 1, has_lion: false },
  { company: "Azure Wealth", industry: "Financial Advisors", member_count: 1, has_lion: false },
  { company: "Exante", industry: "Multi-Asset Financial Services", member_count: 1, has_lion: false },
  { company: "Inflow Finance", industry: "Property Finance", member_count: 1, has_lion: false },
  { company: "Inspired Lending", industry: "Property Finance", member_count: 1, has_lion: false },
  { company: "Forum Insurance", industry: "Insurance Brokers", member_count: 1, has_lion: false },
  { company: "Bridge Insurance", industry: "Insurance", member_count: 1, has_lion: false },
  { company: "Heath Crawford", industry: "Insurance", member_count: 1, has_lion: false },
  { company: "ActionCOACH", industry: "Business Coaching", member_count: 1, has_lion: false },
  { company: "AtomCTO", industry: "IT Services & Consulting", member_count: 1, has_lion: false },
  { company: "MVI", industry: "Media, Publishing & PR", member_count: 1, has_lion: false },
  { company: "DOHR", industry: "HR Specialists", member_count: 1, has_lion: false },
];

export function MembersShowcase() {
  const [rows, setRows] = useState<DirectoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("public_member_directory");
      if (!error && data && data.length > 0) {
        setRows(data as DirectoryRow[]);
        setLive(true);
      } else {
        setRows(CURATED);
        setLive(false);
      }
      setLoading(false);
    })();
  }, []);

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
            and beyond — a sample of the corporate members powering our network.
          </p>
        </ScrollReveal>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 className="animate-spin text-muted-foreground" aria-label="Loading members" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rows.map((m, i) => (
              <ScrollReveal key={`${m.company}-${i}`} delay={Math.min(i, 8) * 30}>
                <div className="flex items-start justify-between gap-3 bg-card border rounded-lg p-4 h-full hover:border-primary/40 hover:shadow-sm transition-all">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Building2 size={13} className="text-muted-foreground/70 shrink-0" aria-hidden="true" />
                      <p className="font-semibold text-sm truncate">{m.company}</p>
                      {m.has_lion && (
                        <Crown size={13} className="text-gold shrink-0" aria-label="Impact Lion member" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{m.industry}</p>
                  </div>
                  {m.member_count > 1 && (
                    <span className="text-[11px] text-muted-foreground bg-muted rounded-full px-2 py-0.5 shrink-0">
                      {m.member_count} members
                    </span>
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}

        <p className="text-center text-sm text-muted-foreground mt-10">
          {live
            ? "Live from the AJBN member directory. Full profiles available to active members after sign-in."
            : "Sample of AJBN corporate members. Full directory available to active members after sign-in."}
        </p>
      </div>
    </section>
  );
}

// Legacy curated array kept above for the anonymous/empty-state fallback.
const _unused: unknown[] = [
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