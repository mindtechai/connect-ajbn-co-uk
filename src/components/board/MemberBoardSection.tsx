import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BoardPostCard } from "@/components/board/BoardPostCard";
import { openMemberConversation } from "@/components/member/MemberActions";
import { useAuth } from "@/hooks/useAuth";
import {
  BOARD_DISCLAIMER,
  fetchLiveBoardPosts,
  type BoardKind,
  type BoardPost,
} from "@/lib/board-posts";

/** "Needs & Offers" board shown on a member profile, below the bio. */
export function MemberBoardSection({
  memberId,
  memberName,
  company,
}: {
  memberId: string;
  memberName: string;
  company?: string | null;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BoardPost[] | null>(null);

  useEffect(() => {
    let active = true;
    void fetchLiveBoardPosts(memberId).then((rows) => {
      if (active) setPosts(rows);
    });
    return () => { active = false; };
  }, [memberId]);

  const contact = async (post: BoardPost) => {
    try {
      const { sendMessage } = await import("@/lib/messaging");
      const conversationId = await openMemberConversation(post.author_id);
      await sendMessage(
        conversationId,
        `Hi — I'd like to discuss your ${post.kind === "need" ? "NEED" : "OFFER"} post "${post.title}" (${post.category}).`,
      );
      await navigate({ to: "/messages/$conversationId", params: { conversationId } });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `${error.message} — you may need to activate messaging first on the Messages page.`
          : "Could not open the chat.",
      );
    }
  };

  const column = (kind: BoardKind) => {
    const rows = (posts ?? []).filter((p) => p.kind === kind);
    return (
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {kind === "need" ? "Needs" : "Offers"}
        </h3>
        {rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            {kind === "need" ? "No needs posted yet" : "No offers posted yet"}
          </p>
        ) : (
          rows.map((post) => (
            <BoardPostCard
              key={post.id}
              post={post}
              author={{ first_name: null, last_name: null, company: company ?? null }}
              authorLabel={memberName}
              showAuthor={false}
              actions={
                post.author_id === user?.id ? null : (
                  <Button size="sm" variant="outline" onClick={() => void contact(post)}>
                    <MessageCircle size={14} /> Contact to Discuss
                  </Button>
                )
              }
            />
          ))
        )}
      </div>
    );
  };

  return (
    <section className="space-y-4 border-t pt-6">
      <div>
        <h2 className="text-lg font-display font-semibold">Needs &amp; Offers</h2>
        <p className="text-xs text-muted-foreground mt-1">{BOARD_DISCLAIMER}</p>
      </div>
      {posts === null ? (
        <div className="py-6 grid place-items-center"><Loader2 className="animate-spin text-muted-foreground" size={18} /></div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {column("need")}
          {column("offer")}
        </div>
      )}
    </section>
  );
}
