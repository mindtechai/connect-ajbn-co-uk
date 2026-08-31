import { createFileRoute } from "@tanstack/react-router";
import ForgotPasswordPage from "@/pages/ForgotPassword";

export const Route = createFileRoute("/forgot-password")({
  // Utility route: kept out of search and AI crawler indexes.
  head: () => ({
    meta: [
      { title: "Reset your password | AJBN Connect" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ForgotPasswordPage,
});
