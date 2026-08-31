import { createFileRoute } from "@tanstack/react-router";
import ReferralRewardsPage from "@/pages/ReferralRewards";

const BASE = "https://connect.ajbn.co.uk";
const TITLE = "Membership Referral Rewards & Tiers | AJBN Connect";
const DESCRIPTION =
  "Earn AJBN membership rewards for introducing businesses and professionals to the network. See membership referral tiers, recognition and Chair's Circle benefits inside our B2B business network.";


export const Route = createFileRoute("/referral-rewards")({
  component: ReferralRewardsPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { property: "og:url", content: `${BASE}/referral-rewards` },
    ],
    links: [{ rel: "canonical", href: `${BASE}/referral-rewards` }],
  }),
});
