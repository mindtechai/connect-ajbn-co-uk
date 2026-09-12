import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import MemberProfilePage from "@/pages/MemberProfile";

export const Route = createFileRoute("/member/$memberId")({
  head: () => ({ meta: [
    { title: "Member profile | AJBN Connect" },
    { name: "description", content: "View an AJBN member profile and connect securely." },
    { property: "og:title", content: "Member profile | AJBN Connect" },
    { property: "og:description", content: "View an AJBN member profile and connect securely." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: () => <RequireAuth><MemberProfilePage /></RequireAuth>,
});