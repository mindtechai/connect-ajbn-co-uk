import { createFileRoute } from "@tanstack/react-router";
import LionsPage from "@/pages/Lions";

export const Route = createFileRoute("/lions/")({
  component: LionsPage,
});
