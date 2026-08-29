import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import MessagesPage from "@/pages/Messages";

export const Route = createFileRoute("/messages/")({
  component: () => (
    <RequireAuth>
      <MessagesPage />
    </RequireAuth>
  ),
});
