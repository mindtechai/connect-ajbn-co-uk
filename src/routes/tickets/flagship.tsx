import { createFileRoute } from "@tanstack/react-router";
import BuyTicketsFlagshipPage from "@/pages/BuyTicketsFlagship";

export const Route = createFileRoute("/tickets/flagship")({
  component: BuyTicketsFlagshipPage,
});
