import { createFileRoute } from "@tanstack/react-router";
import UnsubscribePage from "@/pages/Unsubscribe";

export const Route = createFileRoute("/unsubscribe")({
  component: UnsubscribePage,
});
