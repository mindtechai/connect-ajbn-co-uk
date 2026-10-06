import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import CompleteProfilePage from "@/pages/CompleteProfile";

export const Route = createFileRoute("/complete-profile")({
  head: () => ({
    meta: [
      { title: "Complete your profile | AJBN Connect" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <CompleteProfilePage />
    </RequireAuth>
  ),
});
