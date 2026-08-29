import { createFileRoute } from "@tanstack/react-router";
import EmailUnsubscribePage from "@/pages/EmailUnsubscribe";

export const Route = createFileRoute("/email-unsubscribe")({
  component: EmailUnsubscribePage,
});
