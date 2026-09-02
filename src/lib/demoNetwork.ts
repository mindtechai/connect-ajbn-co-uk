/**
 * Placeholder network data used when the signed-in account has no live
 * records yet (e.g. the app-store review test account). Purely presentational
 * fallbacks — no backend, auth or RLS behaviour is affected.
 */

export type DemoLeaderRow = {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  referral_count: number;
  is_lion: boolean;
};

export const DEMO_REFERRAL_LEADERS: DemoLeaderRow[] = [
  { user_id: "demo-lb-1", first_name: "Priya", last_name: "Shah", company: "Prideview Group", referral_count: 7, is_lion: true },
  { user_id: "demo-lb-2", first_name: "Daniel", last_name: "Cohen", company: "Lubbock Fine", referral_count: 5, is_lion: true },
  { user_id: "demo-lb-3", first_name: "Aisha", last_name: "Rahman", company: "SC&W Legal", referral_count: 4, is_lion: false },
  { user_id: "demo-lb-4", first_name: "Michael", last_name: "Levy", company: "Tradelend", referral_count: 3, is_lion: true },
  { user_id: "demo-lb-5", first_name: "Rakesh", last_name: "Mehta", company: "Ash Verma Consulting", referral_count: 2, is_lion: false },
  { user_id: "demo-lb-6", first_name: "Sarah", last_name: "Goldman", company: "Riddlebox", referral_count: 1, is_lion: true },
];

export const DEMO_ANNOUNCEMENTS = [
  {
    id: "demo-ann-1",
    title: "AJBN Members' Evening — registration open",
    body: "Join us on Thursday 9th July, 6:30 PM at Vyman House, Harrow. Hosted by Vyman Solicitors on their terrace.",
    priority: "normal",
    pinned: true,
    published_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "demo-ann-2",
    title: "Member directory search improvements",
    body: "You can now search names, companies, industries and member tags from one search box in the directory.",
    priority: "normal",
    pinned: false,
    published_at: new Date(Date.now() - 9 * 86400000).toISOString(),
  },
];

export const DEMO_REFERRAL_CODE = "AJBN-DEMO1234";
export const DEMO_REFERRAL_COUNT = 3;
