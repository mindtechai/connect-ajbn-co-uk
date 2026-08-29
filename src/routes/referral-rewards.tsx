import { createFileRoute } from "@tanstack/react-router";
import ReferralRewardsPage from "@/pages/ReferralRewards";

const BASE = "https://connect.ajbn.co.uk";
const TITLE = "Membership Referral Rewards & Tiers | AJBN Connect";
const DESCRIPTION =
  "Earn membership rewards for introducing members to AJBN. See referral tiers, recognition and Chair's Circle benefits inside our professional business networking club.";

export const Route = createFileRoute("/referral-rewards")({
  component: ReferralRewardsPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: `${BASE}/referral-rewards` },
    ],
    links: [{ rel: "canonical", href: `${BASE}/referral-rewards` }],
  }),
});
