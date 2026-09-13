import { createFileRoute } from "@tanstack/react-router";
import InstallPage from "@/pages/Install";

export const Route = createFileRoute("/install")({
  head: () => ({
    meta: [
      { title: "Install AJBN Connect" },
      { name: "description", content: "Add AJBN Connect to your home screen or desktop for quick access to member networking, events, and messaging." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: InstallPage,
});
