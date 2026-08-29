import { createFileRoute } from "@tanstack/react-router";
import SponsorsPartnersPage from "@/pages/SponsorsPartners";

export const Route = createFileRoute("/sponsors-partners")({
  component: SponsorsPartnersPage,
});
