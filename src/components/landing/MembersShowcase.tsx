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
  { company: "AccountingPreneur", industry: "Accountants/Tax Matters", member_count: 1, has_lion: false },
  { company: "ActionCoach", industry: "Business Growth Coach", member_count: 1, has_lion: false },
  { company: "ADBH Advisory Limited", industry: "Immigration Legal Services", member_count: 1, has_lion: false },
  { company: "Affinity Group Financial Services Limited", industry: "Financial Services", member_count: 1, has_lion: false },
  { company: "Alexander Lawson", industry: "Chartered Surveyors", member_count: 1, has_lion: false },
  { company: "Ali Legal", industry: "Law Firm", member_count: 1, has_lion: false },
  { company: "Allica Bank", industry: "Banking", member_count: 1, has_lion: false },
  { company: "Ash Verma Consulting Ltd.", industry: "Business Consultancy", member_count: 1, has_lion: false },
  { company: "Atom CTO", industry: "IT Services & IT Consultancy", member_count: 1, has_lion: false },
  { company: "ATZ Finance", industry: "Commercial, Property & Asset Finance Specialist", member_count: 1, has_lion: false },
  { company: "Azure Wealth", industry: "Wealth Management", member_count: 1, has_lion: false },
  { company: "B2Bfinance.com", industry: "Commercial Finance Broker", member_count: 1, has_lion: false },
  { company: "BDO", industry: "Accountants & Business Advisors", member_count: 1, has_lion: false },
  { company: "Begbies Traynor", industry: "Corporate Rescue & Recovery", member_count: 1, has_lion: false },
  { company: "Benjamin Stevens Estate Agents", industry: "Estate Agents", member_count: 1, has_lion: false },
  { company: "Berenblut IT Training & Consultancy", industry: "IT Training & Consultancy", member_count: 1, has_lion: false },
  { company: "Bhardwaj Insolvency Practitioners", industry: "Insolvency Practitioners", member_count: 1, has_lion: false },
  { company: "Bika Construction Ltd", industry: "Construction", member_count: 1, has_lion: false },
  { company: "BKL", industry: "Accountants/Tax Consultants", member_count: 1, has_lion: false },
  { company: "Blake Morgan", industry: "Law Firm", member_count: 1, has_lion: false },
  { company: "Bridge Insurance Brokers Limited", industry: "Insurance Brokers", member_count: 1, has_lion: false },
  { company: "Clear Insurance Management", industry: "Insurance", member_count: 1, has_lion: false },
  { company: "Clegg Gifford", industry: "Insurance Brokers", member_count: 1, has_lion: false },
  { company: "Clitheroe Shah Consultancy Services", industry: "Business & Management Consultancy", member_count: 1, has_lion: false },
  { company: "Cooper Parry", industry: "Accountants/Tax Advisors", member_count: 1, has_lion: false },
  { company: "Coots & Boots", industry: "Pet Services & Supplies", member_count: 1, has_lion: false },
  { company: "Core Financial Paraplanning Limited", industry: "Financial Services", member_count: 1, has_lion: false },
  { company: "Crestcom - Greater London", industry: "Leadership & Management Training", member_count: 1, has_lion: false },
  { company: "Crispy Dog Productions", industry: "Video Production", member_count: 1, has_lion: false },
  { company: "Crown Fire Systems Ltd", industry: "Fire Safety Systems", member_count: 1, has_lion: false },
  { company: "Custodia", industry: "Crypto & Digital Asset Custody", member_count: 1, has_lion: false },
  { company: "Desaga Recruitment", industry: "Recruitment Agency", member_count: 1, has_lion: false },
  { company: "Devonshires Solicitors", industry: "Law Firm", member_count: 1, has_lion: false },
  { company: "DKLM", industry: "Solicitors", member_count: 1, has_lion: false },
  { company: "DNS Accountants Ltd", industry: "Accountants/Tax Advisors", member_count: 1, has_lion: false },
  { company: "DOHR", industry: "HR Support & Consultancy", member_count: 1, has_lion: false },
  { company: "Dooa Captial", industry: "Structured Finance", member_count: 1, has_lion: false },
  { company: "Edwin Coe", industry: "Law Firm", member_count: 1, has_lion: false },
  { company: "Enlight Group", industry: "Security Services", member_count: 1, has_lion: false },
  { company: "Eureka Capital Allowances", industry: "Capital Allowances Specialists", member_count: 1, has_lion: false },
  { company: "Expedium", industry: "Logistics & Transport", member_count: 1, has_lion: false },
  { company: "Finawis Advisors", industry: "Wealth Management Solutions", member_count: 1, has_lion: false },
  { company: "First Financial", industry: "Mortgage & Finance Brokers", member_count: 1, has_lion: false },
  { company: "Five Star Estates", industry: "Property Management & Lettings", member_count: 1, has_lion: false },
  { company: "FRP Advisory Trading Limited", industry: "Business Advisory", member_count: 1, has_lion: false },
  { company: "Full Power Utilities", industry: "Energy Consultants", member_count: 1, has_lion: false },
  { company: "Funnel Automation", industry: "Marketing Automation", member_count: 1, has_lion: false },
  { company: "Gardner’s Trees", industry: "Arboricultural Services", member_count: 1, has_lion: false },
  { company: "GB Bank", industry: "Property Development Finance Bank", member_count: 1, has_lion: false },
  { company: "Genesis Advisory Services (UK) Ltd", industry: "Financial Advisors", member_count: 1, has_lion: false },
  { company: "Gravita", industry: "Accountants & Business Advisors", member_count: 1, has_lion: false },
  { company: "Gryphon Property Partners", industry: "Commercial Property Advisers", member_count: 1, has_lion: false },
  { company: "Hammered", industry: "Property Auction Data & Analytics", member_count: 1, has_lion: false },
  { company: "Hartsbourne Country Club", industry: "Golf & Country Club", member_count: 1, has_lion: false },
  { company: "Heath Crawford", industry: "Insurance Brokers", member_count: 1, has_lion: false },
  { company: "Hodge Jones & Allen", industry: "Law Firm", member_count: 1, has_lion: false },
  { company: "Housing Enterprise Solutions Ltd", industry: "Housing & Property Consultants", member_count: 1, has_lion: false },
  { company: "HSBC", industry: "Banking", member_count: 1, has_lion: false },
  { company: "Inegral Advice Ltd", industry: "Financial & Strategic Advice", member_count: 1, has_lion: false },
  { company: "Inflow Finance", industry: "Property & Commercial Finance", member_count: 1, has_lion: false },
  { company: "Inspired Lending", industry: "Bridging & Property Finance", member_count: 1, has_lion: false },
  { company: "Investec", industry: "Private Banking & Wealth Management", member_count: 1, has_lion: false },
  { company: "JLP Productions", industry: "Event Production & Management", member_count: 1, has_lion: false },
  { company: "JSL Actuarial Ltd", industry: "Actuarial Services", member_count: 1, has_lion: false },
  { company: "Jury O'Shea", industry: "Solicitors", member_count: 1, has_lion: false },
  { company: "Kallis", industry: "Insolvency Practitioners", member_count: 1, has_lion: false },
  { company: "Landlord Property Exchange", industry: "Property Matching Platform", member_count: 1, has_lion: false },
  { company: "Laurence Grant", industry: "Estate Agents", member_count: 1, has_lion: false },
  { company: "LDN Finance", industry: "Mortgage & Finance Brokers", member_count: 1, has_lion: false },
  { company: "LETSiNVEST", industry: "Property Investment Platform", member_count: 1, has_lion: false },
  { company: "London Credit", industry: "Bridging Loans Provider", member_count: 1, has_lion: false },
  { company: "Lubbock Fine", industry: "Accountants & Business Advisors", member_count: 1, has_lion: false },
  { company: "Machins Solicitors", industry: "Law Firm", member_count: 1, has_lion: false },
  { company: "Make A Point", industry: "Branding & Creative Agency", member_count: 1, has_lion: false },
  { company: "Manak Solicitors", industry: "Law Firm", member_count: 1, has_lion: false },
  { company: "Maris Interiors", industry: "Office Design & Fit-Out", member_count: 1, has_lion: false },
  { company: "Metrus Property Advisors", industry: "Property Asset Management", member_count: 1, has_lion: false },
  { company: "MGI Holdings", industry: "Property Investment & Management", member_count: 1, has_lion: false },
  { company: "Mizrahi Tefahot Bank Ltd", industry: "Banking", member_count: 1, has_lion: false },
  { company: "Morphosis Venture Capital", industry: "Venture Capital", member_count: 1, has_lion: false },
  { company: "Mortimer Street Capital", industry: "Property & Commercial Finance", member_count: 1, has_lion: false },
  { company: "MT Finance", industry: "Bridging & Property Finance", member_count: 1, has_lion: false },
  { company: "Navigate Business Recovery Ltd", industry: "Insolvency & Business Recovery", member_count: 1, has_lion: false },
  { company: "Nishma Shah", industry: "Health & Wellness Coach", member_count: 1, has_lion: false },
  { company: "Nyman Libson Paul", industry: "Accountants & Business Advisors", member_count: 1, has_lion: false },
  { company: "Omnia Housing Ltd", industry: "Property Management & Social Housing", member_count: 1, has_lion: false },
  { company: "Oracle Solicitors", industry: "Law Firm", member_count: 1, has_lion: false },
  { company: "Orwins", industry: "Chartered Surveyors", member_count: 1, has_lion: false },
  { company: "Phillip Shaw", industry: "Estate Agents & Surveyors", member_count: 1, has_lion: false },
  { company: "Pinnacle Global Group", industry: "Business Consulting & Logistics", member_count: 1, has_lion: false },
  { company: "Plumbing on Demand", industry: "Plumbing & Heating Services", member_count: 1, has_lion: false },
  { company: "Point 2 Surveyors", industry: "Chartered Building Surveyors", member_count: 1, has_lion: false },
  { company: "Prideview Group", industry: "Commercial Property Investment", member_count: 1, has_lion: false },
  { company: "Q Asset Management", industry: "Property Asset Management", member_count: 1, has_lion: false },
  { company: "Quastels", industry: "Law Firm", member_count: 1, has_lion: false },
  { company: "Red Rock Mortgages Ltd", industry: "Mortgage Broker", member_count: 1, has_lion: false },
  { company: "Reim Capital", industry: "Bridging Finance", member_count: 1, has_lion: false },
  { company: "Rosenblatt Law", industry: "Legal Services", member_count: 1, has_lion: false },
  { company: "Roundtree Real Estate", industry: "Estate Agents", member_count: 1, has_lion: false },
  { company: "RWK Goodman", industry: "Law Firm", member_count: 1, has_lion: false },
  { company: "RYSE Finance Ltd", industry: "Commercial & Property Finance", member_count: 1, has_lion: false },
  { company: "Saul Gerrard Surveyors", industry: "Chartered Surveyors", member_count: 1, has_lion: false },
  { company: "SBI UK Ltd", industry: "Banking", member_count: 1, has_lion: false },
  { company: "Seddons GSC", industry: "Law Firm", member_count: 1, has_lion: false },
  { company: "Seduolo", industry: "Business Services", member_count: 1, has_lion: false },
  { company: "Shawbrook Bank", industry: "Specialist Banking & Finance", member_count: 1, has_lion: false },
  { company: "Sherrards Solicitors", industry: "Law Firm", member_count: 1, has_lion: false },
  { company: "Singletree Accountants", industry: "Accountants", member_count: 1, has_lion: false },
  { company: "Sirius Finance", industry: "Debt & Property Finance Broker", member_count: 1, has_lion: false },
  { company: "SJC Finance", industry: "Property Finance Broker", member_count: 1, has_lion: false },
  { company: "Sobell Rhodes", industry: "Accountants/Tax Consultants", member_count: 1, has_lion: false },
  { company: "Spector Constant & Williams", industry: "Law Firm", member_count: 1, has_lion: false },
  { company: "Squire Patton Boggs", industry: "Global Law Firm", member_count: 1, has_lion: false },
  { company: "Sterling Property Assets", industry: "Property Investment", member_count: 1, has_lion: false },
  { company: "Sterlingworth Surveyors Ltd", industry: "Chartered Surveyors", member_count: 1, has_lion: false },
  { company: "Technica Solutions", industry: "IT Managed Services", member_count: 1, has_lion: false },
  { company: "The Dot HQ", industry: "Digital Marketing & Technology", member_count: 1, has_lion: false },
  { company: "The TMS Group (Taylor Mac Solutions Ltd)", industry: "Commercial & Property Finance", member_count: 1, has_lion: false },
  { company: "Together", industry: "Specialist Property Finance", member_count: 1, has_lion: false },
  { company: "Tradelend", industry: "Trade & Invoice Finance", member_count: 1, has_lion: false },
  { company: "Treacle Factory", industry: "Creative Digital Agency", member_count: 1, has_lion: false },
  { company: "Utility Warehouse", industry: "Utility & Energy Services", member_count: 1, has_lion: false },
  { company: "VEA", industry: "Virtual Assistant Services", member_count: 1, has_lion: false },
  { company: "Velvet Home Inventories", industry: "Property Inventory Services", member_count: 1, has_lion: false },
  { company: "Virgin Money", industry: "Banking", member_count: 1, has_lion: false },
  { company: "VS Management", industry: "Property Management", member_count: 1, has_lion: false },
  { company: "VWV", industry: "Law Firm", member_count: 1, has_lion: false },
  { company: "Vyman Solicitors", industry: "Law Firm", member_count: 1, has_lion: false },
  { company: "WealthInvest Group", industry: "Property Investment & Wealth Management", member_count: 1, has_lion: false },
  { company: "Wellbeing Living Ltd", industry: "Supported Living Services", member_count: 1, has_lion: false },
  { company: "Whitehall Capital", industry: "Bridging & Development Finance", member_count: 1, has_lion: false },
  { company: "Winkworth Hendon & Kingsbury", industry: "Estate Agents", member_count: 1, has_lion: false },
  { company: "Wow Merchandise", industry: "Promotional Branded Merchandise", member_count: 1, has_lion: false },
  { company: "Xanda", industry: "Web Design & Digital Marketing Agency", member_count: 1, has_lion: false },
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