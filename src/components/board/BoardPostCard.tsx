import type { ReactNode } from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BoardPostReportButton } from "@/components/board/BoardPostReportButton";
import { daysLeft, postedOn, type BoardAuthor, type BoardPost } from "@/lib/board-posts";

type Props = {
  post: BoardPost;
  author?: BoardAuthor | undefined;
  authorLabel: string;
  /** Show the poster's name and company (feed + profile of others). */
  showAuthor?: boolean;
  actions?: ReactNode;
};

export function BoardPostCard({ post, author, authorLabel, showAuthor = true, actions }: Props) {
  return (
    <div className="bg-card border rounded-xl p-5 shadow-xs space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={post.kind === "offer" ? "default" : "secondary"} className="text-[10px]">
            {post.kind === "offer" ? "Offer" : "Need"}
          </Badge>
          <p className="font-semibold text-sm">{post.title}</p>
        </div>
        <Badge variant="outline" className="text-[10px] shrink-0">{post.category}</Badge>
      </div>
      <p className="text-xs text-muted-foreground whitespace-pre-line">{post.description}</p>
      {showAuthor && (
        <p className="text-[11px] text-muted-foreground/80">
          {authorLabel}{author?.company ? ` · ${author.company}` : ""}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t">
        <span className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Clock size={11} /> {postedOn(post.created_at)} · {daysLeft(post.expires_at)}
        </span>
        <div className="ml-auto flex items-center gap-3">
          {actions}
          <BoardPostReportButton post={post} authorName={authorLabel} />
        </div>
      </div>
    </div>
  );
}
