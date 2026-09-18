import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, HandHeart, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { daysLeft, deleteBoardPost, fetchLiveBoardPosts, type BoardPost } from "@/lib/board-posts";

/** "Your Needs & Offers" — the signed-in member's own live posts. */
export function MyBoardPostsCard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BoardPost[]>([]);

  const load = useCallback(async () => {
    if (!user) return;
    setPosts(await fetchLiveBoardPosts(user.id));
  }, [user?.id]);

  useEffect(() => {
    void load();
    const onChanged = () => void load();
    window.addEventListener("ajbn-board-posts-changed", onChanged);
    return () => window.removeEventListener("ajbn-board-posts-changed", onChanged);
  }, [load]);

  const remove = async (id: string) => {
    try {
      await deleteBoardPost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Post removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove the post.");
    }
  };

  return (
    <div className="bg-card border rounded-xl p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-4">
        <HandHeart size={18} className="text-teal" />
        <h3 className="font-semibold text-sm">Your Needs &amp; Offers</h3>
      </div>
      <div className="space-y-3">
        {posts.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            You haven't posted anything yet. Post a need or an offer and fellow members can help.
          </p>
        ) : (
          <>
            <ul className="space-y-2">
              {posts.map((p) => (
                <li key={p.id} className="flex items-start gap-2">
                  <Badge variant={p.kind === "offer" ? "default" : "secondary"} className="text-[10px] shrink-0">
                    {p.kind === "offer" ? "Offer" : "Need"}
                  </Badge>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{p.title}</p>
                    <p className="text-[11px] text-muted-foreground">{p.category} · {daysLeft(p.expires_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to="/board"
                      className="text-[11px] text-primary hover:text-primary/80"
                      aria-label={`Edit ${p.title} on the board`}
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => void remove(p.id)}
                      aria-label={`Delete ${p.title}`}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-muted-foreground">
              Visible on your profile board and in the Needs &amp; Offers feed for all members.
            </p>
          </>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <Button asChild variant="ghost" size="sm" className="text-xs">
            <Link to="/board">Post a need or offer <ArrowRight size={14} /></Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-xs">
            <Link to="/needs-offers">Browse all <ArrowRight size={14} /></Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
