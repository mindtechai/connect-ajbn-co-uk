import { createFileRoute } from "@tanstack/react-router";
import ResetPasswordPage from "@/pages/ResetPassword";

export const Route = createFileRoute("/reset-password")({
  // Utility route: kept out of search and AI crawler indexes.
  head: () => ({
    meta: [
      { title: "Set a new password | AJBN Connect" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});
