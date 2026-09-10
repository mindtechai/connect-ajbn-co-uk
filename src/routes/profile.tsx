import { createFileRoute, redirect } from "@tanstack/react-router";

// Convenience alias: /profile is a common entry point (app shortcuts, store
// listings) and simply forwards to the real profile settings screen.
export const Route = createFileRoute("/profile")({
  beforeLoad: () => {
    throw redirect({ to: "/settings/profile" });
  },
});
