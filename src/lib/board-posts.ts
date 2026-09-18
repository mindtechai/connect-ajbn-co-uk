// Shared data layer for the Needs & Offers board (table: board_posts).
// Used by the board page, the member profile board and the all-member feed.

import { supabase } from "@/integrations/supabase/client";

export const BOARD_CATEGORIES = ["Property", "Finance", "Legal", "Tax", "Other"] as const;
export type BoardCategory = (typeof BOARD_CATEGORIES)[number];
export type BoardKind = "need" | "offer";

export const BOARD_DISCLAIMER =
  "Needs and Offers are member-provided, not recommendations — conduct your own due diligence.";

export type BoardPost = {
  id: string;
  author_id: string;
  kind: BoardKind;
  title: string;
  description: string;
  category: BoardCategory;
  expires_at: string;
  created_at: string;
};

export type BoardAuthor = {
  first_name: string | null;
  last_name: string | null;
  company: string | null;
};

export function authorName(author: BoardAuthor | undefined): string {
  return `${author?.first_name ?? ""} ${author?.last_name ?? ""}`.trim() || "AJBN member";
}

export function daysLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const days = Math.ceil(ms / 86_400_000);
  return days === 1 ? "1 day left" : `${days} days left`;
}

export function postedOn(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const SELECT = "id, author_id, kind, title, description, category, expires_at, created_at";

/** Live (non-expired) posts, newest first. Pass an author id to scope to one member. */
export async function fetchLiveBoardPosts(authorId?: string): Promise<BoardPost[]> {
  let query = supabase
    .from("board_posts")
    .select(SELECT)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });
  if (authorId) query = query.eq("author_id", authorId);
  const { data, error } = await query;
  if (error) {
    console.error("board_posts read failed", error);
    return [];
  }
  return (data ?? []) as BoardPost[];
}

export async function fetchBoardAuthors(ids: string[]): Promise<Record<string, BoardAuthor>> {
  const unique = Array.from(new Set(ids));
  if (!unique.length) return {};
  const { data } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, company")
    .in("id", unique);
  const map: Record<string, BoardAuthor> = {};
  (data ?? []).forEach((row: Record<string, unknown>) => {
    map[String(row["id"])] = {
      first_name: (row["first_name"] as string) ?? null,
      last_name: (row["last_name"] as string) ?? null,
      company: (row["company"] as string) ?? null,
    };
  });
  return map;
}

export async function deleteBoardPost(id: string): Promise<void> {
  const { error } = await supabase.from("board_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
