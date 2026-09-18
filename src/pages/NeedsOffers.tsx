import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { HandHeart, Loader2, MessageCircle, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { AppLayout } from "@/components/AppLayout";
import { BoardPostCard } from "@/components/board/BoardPostCard";
import { openMemberConversation } from "@/components/member/MemberActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import {
  BOARD_CATEGORIES,
  BOARD_DISCLAIMER,
  authorName,
  deleteBoardPost,
  fetchBoardAuthors,
  fetchLiveBoardPosts,
  type BoardAuthor,
  type BoardPost,
} from "@/lib/board-posts";

type Filter = "all" | "need" | "offer";

export default function NeedsOffersPage() {
  const { user, isApprovedMember, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [authors, setAuthors] = useState<Record<string, BoardAuthor>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const rows = await fetchLiveBoardPosts();
    setPosts(rows);
    setAuthors(await fetchBoardAuthors(rows.map((r) => r.author_id)));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isApprovedMember) { setLoading(false); return; }
    void load();
  }, [authLoading, isApprovedMember, load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      if (filter !== "all" && p.kind !== filter) return false;
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      const name = authorName(authors[p.author_id]).toLowerCase();
      const company = (authors[p.author_id]?.company ?? "").toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        name.includes(q) ||
        company.includes(q)
      );
    });
  }, [posts, filter, category, search, authors]);

  const message = async (post: BoardPost) => {
    try {
      const conversationId = await openMemberConversation(post.author_id);
      await navigate({ to: "/messages/$conversationId", params: { conversationId } });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `${error.message} — you may need to activate messaging first on the Messages page.`
          : "Could not open the chat.",
      );
    }
  };

  const remove = async (post: BoardPost) => {
    try {
      await deleteBoardPost(post.id);
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      window.dispatchEvent(new Event("ajbn-board-posts-changed"));
      toast.success("Post removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove the post.");
    }
  };

  if (loading) {
    return (
      <AppLayout maxWidth="4xl">
        <div className="py-20 grid place-items-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
      </AppLayout>
    );
  }

  return (
    <AppLayout maxWidth="4xl">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold">All Needs &amp; Offers</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Everything AJBN members currently need or can offer. Posts stay live for 7 days.
        </p>
      </div>

      {!isApprovedMember ? (
        <div className="bg-card border rounded-xl p-6 text-sm text-muted-foreground">
          Members only — this feed opens once your AJBN membership is approved. Questions? Email
          {" "}<a className="underline" href="mailto:admin@ajbn.co.uk">admin@ajbn.co.uk</a>.
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-xs text-muted-foreground">{BOARD_DISCLAIMER}</p>

          <div className="flex flex-wrap items-center gap-3">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="need">Needs</TabsTrigger>
                <TabsTrigger value="offer">Offers</TabsTrigger>
              </TabsList>
            </Tabs>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-[170px]"><SelectValue placeholder="All categories" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {BOARD_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="sm:max-w-xs"
              placeholder="Search tax planning, property..."
              aria-label="Search needs and offers"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button asChild variant="outline" size="sm" className="ml-auto">
              <Link to="/board"><HandHeart size={15} /> Post a need or offer</Link>
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {visible.map((post) => {
              const label = authorName(authors[post.author_id]);
              const isMine = post.author_id === user?.id;
              return (
                <BoardPostCard
                  key={post.id}
                  post={post}
                  author={authors[post.author_id]}
                  authorLabel={label}
                  actions={
                    isMine ? (
                      <button
                        onClick={() => void remove(post)}
                        className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    ) : (
                      <>
                        <Link
                          to="/member/$memberId"
                          params={{ memberId: post.author_id }}
                          className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                        >
                          <User size={12} /> View Profile
                        </Link>
                        <button
                          onClick={() => void message(post)}
                          className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                        >
                          <MessageCircle size={12} /> Message
                        </button>
                      </>
                    )
                  }
                />
              );
            })}
            {visible.length > 0 && !visible.some((p) => p.author_id !== user?.id) && (
              <p className="sm:col-span-2 text-xs text-muted-foreground border rounded-lg p-3 bg-muted/30">
                Other members' posts will appear here with Report and Block options.
              </p>
            )}
            {visible.length === 0 && (
              <p className="sm:col-span-2 text-center text-sm text-muted-foreground py-10">
                Nothing matches your filters yet.
              </p>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  );
}
