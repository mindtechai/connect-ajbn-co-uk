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

// Curated fallback used before real members exist in the DB.
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
      if (!error && Array.isArray(data) && data.length > 0) {
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