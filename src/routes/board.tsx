import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/RequireAuth";
import BoardPage from "@/pages/Board";

export const Route = createFileRoute("/board")({
  // Member-only area: kept out of search and AI crawler indexes.
  head: () => ({
    meta: [
      { title: "Needs & Offers board | AJBN Connect" },
      {
        name: "description",
        content:
          "Post what you need or what you can offer to fellow AJBN members. Posts expire after 7 days.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => (
    <RequireAuth>
      <BoardPage />
    </RequireAuth>
  ),
});
