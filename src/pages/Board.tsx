import { useCallback, useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "@/lib/router-compat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { HandHeart, Loader2, Trash2 } from "lucide-react";
import { openMemberConversation } from "@/components/member/MemberActions";
import { BoardPostCard } from "@/components/board/BoardPostCard";
import { BOARD_DISCLAIMER } from "@/lib/board-posts";

const CATEGORIES = ["Property", "Finance", "Legal", "Tax", "Other"] as const;
type Category = (typeof CATEGORIES)[number];
type Kind = "need" | "offer";

type BoardPost = {
  id: string;
  author_id: string;
  kind: Kind;
  title: string;
  description: string;
  category: Category;
  expires_at: string;
  created_at: string;
};

type AuthorInfo = { first_name: string | null; last_name: string | null; company: string | null };

function daysLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const days = Math.ceil(ms / 86_400_000);
  return days === 1 ? "1 day left" : `${days} days left`;
}

export default function BoardPage() {
  const { user, session, roles, isApprovedMember: canAccessMembersCorner, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const hasRealSession = !!session?.access_token && session.access_token !== "demo";
  const isApprovedMember = canAccessMembersCorner;

  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [authors, setAuthors] = useState<Record<string, AuthorInfo>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Kind>("need");
  const [category, setCategory] = useState<string>("all");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "Property" as Category });

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("board_posts")
      .select("id, author_id, kind, title, description, category, expires_at, created_at")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    if (error) console.error("board_posts read failed", error);
    const rows = (data ?? []) as BoardPost[];
    setPosts(rows);

    const ids = Array.from(new Set(rows.map((r) => r.author_id)));
    if (ids.length) {
      const { data: people } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, company")
        .in("id", ids);
      const map: Record<string, AuthorInfo> = {};
      (people ?? []).forEach((p: Record<string, unknown>) => {
        map[String(p["id"])] = {
          first_name: (p["first_name"] as string) ?? null,
          last_name: (p["last_name"] as string) ?? null,
          company: (p["company"] as string) ?? null,
        };
      });
      setAuthors(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    if (!hasRealSession || !isApprovedMember) { setLoading(false); return; }
    void load();
  }, [authLoading, user, hasRealSession, isApprovedMember, load]);

  const visible = useMemo(
    () => posts.filter((p) => p.kind === tab && (category === "all" || p.category === category)),
    [posts, tab, category],
  );

  const submit = async () => {
    if (!user) return;
    if (form.title.trim().length < 3) {
      toast.error("Please add a short title.");
      return;
    }
    if (form.description.trim().length < 10) {
      toast.error("Please describe what you need or offer.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("board_posts").insert({
      author_id: user.id,
      kind: tab,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
    } as never);
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "Could not post right now.");
      return;
    }
    setForm({ title: "", description: "", category: "Property" });
    toast.success(
      tab === "need"
        ? "Need posted — visible on your profile board and in the Needs & Offers feed."
        : "Offer posted — visible on your profile board and in the Needs & Offers feed.",
    );
    window.dispatchEvent(new Event("ajbn-board-posts-changed"));
    void load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("board_posts").delete().eq("id", id);
    if (error) {
      toast.error(error.message || "Could not remove the post.");
      return;
    }
    setPosts((prev) => prev.filter((p) => p.id !== id));
    window.dispatchEvent(new Event("ajbn-board-posts-changed"));
    toast.success("Post removed.");
  };

  const help = async (post: BoardPost) => {
    try {
      const { sendMessage } = await import("@/lib/messaging");
      const conversationId = await openMemberConversation(post.author_id);
      await sendMessage(
        conversationId,
        `Hi — I can help with your ${post.kind === "need" ? "NEED" : "OFFER"} post "${post.title}" (${post.category}).`,
      );
      navigate(`/messages/${conversationId}`);
    } catch (e: unknown) {
      toast.error(
        e instanceof Error
          ? `${e.message} — you may need to activate messaging first on the Messages page.`
          : "Could not send the message.",
      );
    }
  };

  if (loading) {
    return (
      <AppLayout maxWidth="4xl">
        <div className="py-20 grid place-items-center">
          <Loader2 className="animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout maxWidth="4xl">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold">Needs &amp; Offers Board</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Post what you need or what you can offer. Posts expire automatically after 7 days, and appear
          on your profile board and in the all-member feed.
        </p>
        <p className="text-xs text-muted-foreground mt-2">{BOARD_DISCLAIMER}</p>
        <Button asChild variant="outline" size="sm" className="mt-3">
          <Link to="/needs-offers">Browse all Needs &amp; Offers</Link>
        </Button>
      </div>

      {!isApprovedMember ? (
        <div className="bg-card border rounded-xl p-6 text-sm text-muted-foreground">
          The board opens once your AJBN membership is approved.
        </div>
      ) : (
        <Tabs value={tab} onValueChange={(v) => setTab(v as Kind)}>
          <TabsList className="mb-4">
            <TabsTrigger value="need">NEED</TabsTrigger>
            <TabsTrigger value="offer">OFFER</TabsTrigger>
          </TabsList>

          {(["need", "offer"] as Kind[]).map((k) => (
            <TabsContent key={k} value={k} className="space-y-6">
              <div className="bg-card border rounded-xl p-5 shadow-xs space-y-4">
                <h2 className="text-sm font-semibold">
                  {k === "need" ? "Post a need" : "Post an offer"}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="board-title">Title</Label>
                    <Input
                      id="board-title"
                      value={form.title}
                      maxLength={120}
                      placeholder={k === "need" ? "Looking for a commercial surveyor" : "Offering pro-bono tax review"}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="board-desc">Description</Label>
                    <Textarea
                      id="board-desc"
                      rows={4}
                      maxLength={1200}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Category</Label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v as Category })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <p className="text-xs text-muted-foreground">Expires in 7 days.</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => void submit()} disabled={submitting}>
                    {submitting && <Loader2 size={14} className="animate-spin mr-1" />} Post
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold">
                  {k === "need" ? "Current needs" : "Current offers"} ({visible.length})
                </h2>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {visible.map((p) => {
                  const a = authors[p.author_id];
                  const name = `${a?.first_name ?? ""} ${a?.last_name ?? ""}`.trim() || "AJBN member";
                  return (
                    <BoardPostCard
                      key={p.id}
                      post={p}
                      author={a}
                      authorLabel={name}
                      actions={
                        p.author_id === user?.id ? (
                          <button
                            onClick={() => void remove(p.id)}
                            className="text-xs text-destructive hover:text-destructive/80 flex items-center gap-1"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        ) : (
                          <button
                            onClick={() => void help(p)}
                            className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                          >
                            <HandHeart size={12} /> I can help
                          </button>
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
                    Nothing posted here yet.
                  </p>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </AppLayout>
  );
}
