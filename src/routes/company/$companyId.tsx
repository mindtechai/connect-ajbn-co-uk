import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import CompanyProfilePage from "@/pages/CompanyProfile";

export const Route = createFileRoute("/company/$companyId")({
  head: () => ({ meta: [
    { title: "Company profile | AJBN Connect" },
    { name: "description", content: "View an AJBN corporate member listing." },
    { property: "og:title", content: "Company profile | AJBN Connect" },
    { property: "og:description", content: "View an AJBN corporate member listing." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: () => <RequireAuth><CompanyProfilePage /></RequireAuth>,
});