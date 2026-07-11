// Local demo store for network deal ticker. No backend calls.
export type DemoDeal = {
  id: string;
  deal_type: string;
  amount_gbp: number;
  counterparty_name: string | null;
  notes: string | null;
  created_at: string;
};

const KEY = "ajbn_demo_deals_v1";
const SEEDED_KEY = "ajbn_demo_deals_seeded_v1";
export const DEMO_DEALS_EVENT = "ajbn-demo-deals-updated";

function read(): DemoDeal[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(list: DemoDeal[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(DEMO_DEALS_EVENT));
}
function uid() { return `deal-${Math.random().toString(36).slice(2, 10)}`; }

export function ensureSeededDeals() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(SEEDED_KEY)) return;
  const seeds: DemoDeal[] = [
    { id: uid(), deal_type: "Capital Introduction", amount_gbp: 120000, counterparty_name: "Meridian Capital", notes: null, created_at: new Date(Date.now() - 86400000 * 21).toISOString() },
    { id: uid(), deal_type: "Property Deal", amount_gbp: 85000, counterparty_name: "Harrow Estates", notes: null, created_at: new Date(Date.now() - 86400000 * 18).toISOString() },
    { id: uid(), deal_type: "Business Referral", amount_gbp: 22000, counterparty_name: "Vyman Solicitors", notes: null, created_at: new Date(Date.now() - 86400000 * 14).toISOString() },
    { id: uid(), deal_type: "Joint Venture", amount_gbp: 60000, counterparty_name: "Northline Ventures", notes: null, created_at: new Date(Date.now() - 86400000 * 12).toISOString() },
    { id: uid(), deal_type: "Advisory Engagement", amount_gbp: 15000, counterparty_name: "Kensington Advisory", notes: null, created_at: new Date(Date.now() - 86400000 * 10).toISOString() },
    { id: uid(), deal_type: "Capital Introduction", amount_gbp: 45000, counterparty_name: "Aster Fund", notes: null, created_at: new Date(Date.now() - 86400000 * 8).toISOString() },
    { id: uid(), deal_type: "Property Deal", amount_gbp: 32000, counterparty_name: "Wembley Yards", notes: null, created_at: new Date(Date.now() - 86400000 * 7).toISOString() },
    { id: uid(), deal_type: "Business Referral", amount_gbp: 8000, counterparty_name: "Beacon Accounting", notes: null, created_at: new Date(Date.now() - 86400000 * 6).toISOString() },
    { id: uid(), deal_type: "Advisory Engagement", amount_gbp: 12000, counterparty_name: "Orbit Partners", notes: null, created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
    { id: uid(), deal_type: "Joint Venture", amount_gbp: 9000, counterparty_name: "Pinegate Holdings", notes: null, created_at: new Date(Date.now() - 86400000 * 4).toISOString() },
    { id: uid(), deal_type: "Capital Introduction", amount_gbp: 6500, counterparty_name: "Halcyon Family Office", notes: null, created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
    { id: uid(), deal_type: "Business Referral", amount_gbp: 4500, counterparty_name: "Ridgeway Legal", notes: null, created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: uid(), deal_type: "Property Deal", amount_gbp: 3500, counterparty_name: "Camden Bridge", notes: null, created_at: new Date(Date.now() - 86400000 * 1).toISOString() },
    { id: uid(), deal_type: "Advisory Engagement", amount_gbp: 2500, counterparty_name: "Silverline Advisors", notes: null, created_at: new Date().toISOString() },
  ];
  // Total = 425,000 across 14 transactions
  localStorage.setItem(KEY, JSON.stringify(seeds));
  localStorage.setItem(SEEDED_KEY, "1");
}

export function listDeals(): DemoDeal[] {
  ensureSeededDeals();
  return read();
}

export function totals() {
  const deals = listDeals();
  return {
    total_deal_value_gbp: deals.reduce((s, d) => s + (Number(d.amount_gbp) || 0), 0),
    deal_count: deals.length,
  };
}

export function addDeal(input: Omit<DemoDeal, "id" | "created_at">) {
  ensureSeededDeals();
  const list = read();
  list.push({ ...input, id: uid(), created_at: new Date().toISOString() });
  write(list);
}