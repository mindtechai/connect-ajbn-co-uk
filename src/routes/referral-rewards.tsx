import { createFileRoute } from "@tanstack/react-router";
import ReferralRewardsPage from "@/pages/ReferralRewards";

export const Route = createFileRoute("/referral-rewards")({
  component: ReferralRewardsPage,
});
