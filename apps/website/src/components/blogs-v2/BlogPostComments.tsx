"use client";

import AuthorAvatar from "@/components/blogs-v2/AuthorAvatar";
import BlogSignInDialog from "@/components/blogs-v2/BlogSignInDialog";
import CommentBody from "@/components/blogs-v2/CommentBody";
import CommentRichTextEditor from "@/components/blogs-v2/CommentRichTextEditor";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { BlogV2CommentPublic } from "@/lib/data/blogV2Comments";
import { parseCommentBody } from "@/lib/sanitizeCommentBody";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, MoreHorizontal, ShieldCheck, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

function ClapIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M7 11v5a2 2 0 0 0 2 2h1" />
      <path d="M11 7.5V5a2 2 0 1 1 4 0v8" />
      <path d="M11 11v6.5a2 2 0 0 0 2 2h1.5" />
      <path d="M15 7.5V5a2 2 0 1 1 4 0v6.5" />
      <path d="M15 11v4.5a2 2 0 0 0 2 2H19" />
    </svg>
  );
}

const MAX_VISUAL_DEPTH = 4;
const INDENT_PX = 16;

type SignInAction = "comment" | "reply" | "like";

type BlogPostCommentsProps = {
  blogSlug: string;
  currentUserName?: string;
  currentUserId?: string;
  isSignedIn?: boolean;
  isAdmin?: boolean;
  initialTotalCount?: number;
  onCommentCountChange?: (count: number) => void;
};

function formatCommentDate(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "";
  }
}

function buildAuthorMap(comments: BlogV2CommentPublic[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const c of comments) {
    map.set(c.id, c.authorName);
  }
  return map;
}

type CommentRowProps = {
  comment: BlogV2CommentPublic;
  blogSlug: string;
  currentUserId?: string;
  isSignedIn: boolean;
  isAdmin: boolean;
  authorMap: Map<string, string>;
  onLike: (comment: BlogV2CommentPublic) => void;
  onReply: (commentId: string) => void;
  onDelete: (comment: BlogV2CommentPublic) => void;
  onToggleReplies: (rootId: string) => void;
  repliesExpanded: boolean;
  repliesLoading: boolean;
  replyingToId: string | null;
  onSubmitReply: (body: string, parentId: string) => Promise<void>;
  onCancelReply: () => void;
  renderReplies?: React.ReactNode;
  isReply?: boolean;
};

function CommentRow({
  comment,
  currentUserId,
  isSignedIn,
  isAdmin,
  authorMap,
  onLike,
  onReply,
  onDelete,
  onToggleReplies,
  repliesExpanded,
  repliesLoading,
  replyingToId,
  onSubmitReply,
  onCancelReply,
  renderReplies,
  isReply = false,
}: CommentRowProps) {
  const [bodyExpanded, setBodyExpanded] = useState(false);
  const plainText = parseCommentBody(comment.body)
    .map((s) => s.value)
    .join("");
  const isLong = plainText.length > 140;
  const canDelete =
    comment.replyCount === 0 &&
    (comment.userId === currentUserId || isAdmin);

  const visualDepth = Math.min(comment.depth, MAX_VISUAL_DEPTH);
  const parentAuthor =
    comment.parentId && comment.depth >= MAX_VISUAL_DEPTH
      ? authorMap.get(comment.parentId)
      : null;

  return (
    <article
      className={cn(
        "py-4",
        !isReply && "border-b border-neutral-200 last:border-b-0",
      )}
      style={{ marginLeft: isReply ? visualDepth * INDENT_PX : undefined }}
    >
      <div className="flex gap-3">
        <AuthorAvatar author={comment.authorName} className="h-8 w-8 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              {parentAuthor && (
                <p className="text-xs text-neutral-400 mb-0.5">
                  Replying to {parentAuthor}
                </p>
              )}
              <p className="text-sm font-semibold text-black">{comment.authorName}</p>
              <p className="text-sm text-neutral-500">
                {formatCommentDate(comment.createdAt)}
              </p>
            </div>
            {canDelete && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="p-1 text-neutral-400 hover:text-neutral-600 shrink-0"
                    aria-label="More options"
                  >
                    <MoreHorizontal className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={() => onDelete(comment)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <p className="mt-3 text-base leading-relaxed text-black">
            {isLong && !bodyExpanded ? (
              <>
                {plainText.slice(0, 140).trim()}…{" "}
                <button
                  type="button"
                  className="text-neutral-500 hover:text-neutral-800"
                  onClick={() => setBodyExpanded(true)}
                >
                  more
                </button>
              </>
            ) : (
              <CommentBody body={comment.body} />
            )}
          </p>

          <div className="mt-4 flex items-center gap-5 text-sm text-neutral-500">
            <button
              type="button"
              className={cn(
                "inline-flex items-center gap-1.5 transition-colors",
                comment.likedByCurrentUser
                  ? "text-neutral-900"
                  : "hover:text-neutral-800",
              )}
              onClick={() => onLike(comment)}
            >
              <ClapIcon className="h-4 w-4" />
              <span>{comment.likeCount}</span>
            </button>

            {!isReply && comment.replyCount > 0 && (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 hover:text-neutral-800 transition-colors"
                onClick={() => onToggleReplies(comment.id)}
              >
                <MessageCircle className="h-4 w-4" />
                <span>
                  {repliesLoading
                    ? "Loading…"
                    : `${comment.replyCount} ${comment.replyCount === 1 ? "reply" : "replies"}`}
                </span>
              </button>
            )}

            <button
              type="button"
              className="hover:text-neutral-800 transition-colors"
              onClick={() => onReply(comment.id)}
            >
              Reply
            </button>
          </div>

          {replyingToId === comment.id && (
            <CommentRichTextEditor
              compact
              autoFocus
              submitLabel="Reply"
              placeholder="Write a reply…"
              onSubmit={(body) => onSubmitReply(body, comment.id)}
              onCancel={onCancelReply}
            />
          )}

          {!isReply && repliesExpanded && renderReplies}
        </div>
      </div>
    </article>
  );
}

function ReplyTree({
  replies,
  parentId,
  authorMap,
  ...rowProps
}: Omit<CommentRowProps, "comment" | "isReply" | "repliesExpanded" | "repliesLoading" | "onToggleReplies" | "renderReplies"> & {
  replies: BlogV2CommentPublic[];
  parentId: string;
}) {
  const children = replies.filter((r) => r.parentId === parentId);

  return (
    <>
      {children.map((reply) => (
        <div key={reply.id}>
          <CommentRow
            comment={reply}
            authorMap={authorMap}
            isReply
            repliesExpanded={false}
            repliesLoading={false}
            onToggleReplies={() => {}}
            renderReplies={undefined}
            {...rowProps}
          />
          <ReplyTree
            replies={replies}
            parentId={reply.id}
            authorMap={authorMap}
            {...rowProps}
          />
        </div>
      ))}
    </>
  );
}

export default function BlogPostComments({
  blogSlug,
  currentUserName = "Guest reader",
  currentUserId,
  isSignedIn = false,
  isAdmin = false,
  initialTotalCount = 0,
  onCommentCountChange,
}: BlogPostCommentsProps) {
  const [comments, setComments] = useState<BlogV2CommentPublic[]>([]);
  const [repliesByRoot, setRepliesByRoot] = useState<
    Record<string, BlogV2CommentPublic[]>
  >({});
  const [expandedRoots, setExpandedRoots] = useState<Set<string>>(new Set());
  const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signInAction, setSignInAction] = useState<SignInAction>("comment");
  const [deleteTarget, setDeleteTarget] = useState<BlogV2CommentPublic | null>(
    null,
  );

  const allKnownComments = useMemo(() => {
    const replyList = Object.values(repliesByRoot).flat();
    return [...comments, ...replyList];
  }, [comments, repliesByRoot]);

  const authorMap = useMemo(
    () => buildAuthorMap(allKnownComments),
    [allKnownComments],
  );

  const fetchComments = useCallback(
    async (cursor?: string) => {
      const params = new URLSearchParams({ limit: "10" });
      if (cursor) params.set("cursor", cursor);

      const res = await fetch(
        `/api/blogs/v2/${blogSlug}/comments?${params.toString()}`,
      );
      if (!res.ok) throw new Error("Failed to load comments");

      return res.json() as Promise<{
        comments: BlogV2CommentPublic[];
        nextCursor: string | null;
        totalCount: number;
      }>;
    },
    [blogSlug],
  );

  useEffect(() => {
    setLoading(true);
    fetchComments()
      .then((data) => {
        setComments(data.comments);
        setNextCursor(data.nextCursor);
        setTotalCount(data.totalCount);
        onCommentCountChange?.(data.totalCount);
      })
      .catch(() => toast.error("Could not load comments."))
      .finally(() => setLoading(false));
  }, [blogSlug, fetchComments, onCommentCountChange]);

  useEffect(() => {
    setTotalCount(initialTotalCount);
  }, [initialTotalCount]);

  async function loadMoreComments() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchComments(nextCursor);
      setComments((prev) => [...prev, ...data.comments]);
      setNextCursor(data.nextCursor);
    } catch {
      toast.error("Could not load more comments.");
    } finally {
      setLoadingMore(false);
    }
  }

  async function loadReplies(rootId: string) {
    if (repliesByRoot[rootId]) {
      setExpandedRoots((prev) => new Set(prev).add(rootId));
      return;
    }

    setLoadingReplies((prev) => new Set(prev).add(rootId));
    try {
      const res = await fetch(
        `/api/blogs/v2/${blogSlug}/comments/${rootId}/replies`,
      );
      if (!res.ok) throw new Error("Failed to load replies");
      const data = (await res.json()) as { replies: BlogV2CommentPublic[] };
      setRepliesByRoot((prev) => ({ ...prev, [rootId]: data.replies }));
      setExpandedRoots((prev) => new Set(prev).add(rootId));
    } catch {
      toast.error("Could not load replies.");
    } finally {
      setLoadingReplies((prev) => {
        const next = new Set(prev);
        next.delete(rootId);
        return next;
      });
    }
  }

  function toggleReplies(rootId: string) {
    if (expandedRoots.has(rootId)) {
      setExpandedRoots((prev) => {
        const next = new Set(prev);
        next.delete(rootId);
        return next;
      });
    } else {
      void loadReplies(rootId);
    }
  }

  function requireSignIn(action: SignInAction): boolean {
    if (isSignedIn) return true;
    setSignInAction(action);
    setSignInOpen(true);
    return false;
  }

  async function handleCreateComment(body: string, parentId?: string) {
    if (!requireSignIn(parentId ? "reply" : "comment")) return;

    const res = await fetch(`/api/blogs/v2/${blogSlug}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, parentId }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Could not post comment.");
      throw new Error("Failed to post");
    }

    const created = (await res.json()) as BlogV2CommentPublic;
    setTotalCount((c) => {
      const next = c + 1;
      onCommentCountChange?.(next);
      return next;
    });

    if (parentId) {
      const rootId = created.rootId ?? parentId;
      setExpandedRoots((prev) => new Set(prev).add(rootId));

      try {
        const repliesRes = await fetch(
          `/api/blogs/v2/${blogSlug}/comments/${rootId}/replies`,
        );
        if (repliesRes.ok) {
          const repliesData = (await repliesRes.json()) as {
            replies: BlogV2CommentPublic[];
          };
          setRepliesByRoot((prev) => ({
            ...prev,
            [rootId]: repliesData.replies,
          }));
        }
      } catch {
        setRepliesByRoot((prev) => ({
          ...prev,
          [rootId]: [...(prev[rootId] ?? []), created],
        }));
      }

      const updateReplyCount = (list: BlogV2CommentPublic[]) =>
        list.map((c) =>
          c.id === parentId ? { ...c, replyCount: c.replyCount + 1 } : c,
        );

      setComments((prev) => updateReplyCount(prev));
    } else {
      setComments((prev) => [created, ...prev]);
    }

    setReplyingToId(null);
    toast.success(parentId ? "Reply posted." : "Comment posted.");
  }

  async function handleLike(comment: BlogV2CommentPublic) {
    if (!requireSignIn("like")) return;

    const updateInList = (list: BlogV2CommentPublic[]) =>
      list.map((c) => {
        if (c.id !== comment.id) return c;
        const liked = !c.likedByCurrentUser;
        return {
          ...c,
          likedByCurrentUser: liked,
          likeCount: liked ? c.likeCount + 1 : Math.max(0, c.likeCount - 1),
        };
      });

    setComments((prev) => updateInList(prev));
    setRepliesByRoot((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = updateInList(next[key]);
      }
      return next;
    });

    try {
      const res = await fetch(`/api/blogs/v2/comments/${comment.id}/like`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      const data = (await res.json()) as { liked: boolean; likeCount: number };

      const applyServer = (list: BlogV2CommentPublic[]) =>
        list.map((c) =>
          c.id === comment.id
            ? { ...c, likedByCurrentUser: data.liked, likeCount: data.likeCount }
            : c,
        );

      setComments((prev) => applyServer(prev));
      setRepliesByRoot((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          next[key] = applyServer(next[key]);
        }
        return next;
      });
    } catch {
      setComments((prev) => updateInList(prev));
      setRepliesByRoot((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          next[key] = updateInList(next[key]);
        }
        return next;
      });
      toast.error("Could not update like.");
    }
  }

  async function handleDelete(comment: BlogV2CommentPublic) {
    const res = await fetch(`/api/blogs/v2/comments/${comment.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error ?? "Could not delete comment.");
      return;
    }

    const removeFromList = (list: BlogV2CommentPublic[]) =>
      list.filter((c) => c.id !== comment.id);

    if (comment.parentId) {
      setRepliesByRoot((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          next[key] = removeFromList(next[key]);
        }
        return next;
      });

      const decReplyCount = (list: BlogV2CommentPublic[]) =>
        list.map((c) =>
          c.id === comment.parentId
            ? { ...c, replyCount: Math.max(0, c.replyCount - 1) }
            : c,
        );

      setComments((prev) => decReplyCount(prev));
      setRepliesByRoot((prev) => {
        const next = { ...prev };
        for (const key of Object.keys(next)) {
          next[key] = decReplyCount(next[key]);
        }
        return next;
      });
    } else {
      setComments((prev) => removeFromList(prev));
      setRepliesByRoot((prev) => {
        const next = { ...prev };
        delete next[comment.id];
        return next;
      });
    }

    setTotalCount((c) => {
      const next = Math.max(0, c - 1);
      onCommentCountChange?.(next);
      return next;
    });
    setDeleteTarget(null);
    toast.success("Comment deleted.");
  }

  const signInCopy =
    signInAction === "like"
      ? {
          title: "Sign in to like",
          description:
            "Create a free account or sign in to like comments and show your support.",
        }
      : signInAction === "reply"
        ? {
            title: "Sign in to reply",
            description:
              "Create a free account or sign in to join the conversation.",
          }
        : {
            title: "Sign in to comment",
            description:
              "Create a free account or sign in to share your thoughts on this post.",
          };

  const rowProps = {
    blogSlug,
    currentUserId,
    isSignedIn,
    isAdmin,
    authorMap,
    onLike: handleLike,
    onReply: (id: string) => {
      if (!requireSignIn("reply")) return;
      setReplyingToId(id);
    },
    onDelete: (c: BlogV2CommentPublic) => setDeleteTarget(c),
    onSubmitReply: handleCreateComment,
    onCancelReply: () => setReplyingToId(null),
    replyingToId,
  };

  return (
    <>
      <BlogSignInDialog
        open={signInOpen}
        onOpenChange={setSignInOpen}
        title={signInCopy.title}
        description={signInCopy.description}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone. The comment will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteTarget && void handleDelete(deleteTarget)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <section id="blog-comments" className="mt-16 not-prose">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-black">
            Responses ({totalCount})
          </h2>
          <ShieldCheck className="h-5 w-5 text-neutral-400" aria-hidden />
        </div>

        <div className="mt-6">
          <div className="flex items-center gap-2 mb-3">
            <AuthorAvatar author={currentUserName} className="h-6 w-6" />
            <span className="text-sm text-black">{currentUserName}</span>
          </div>
          <CommentRichTextEditor
            userName={currentUserName}
            onSubmit={(body) => handleCreateComment(body)}
          />
        </div>

        <div className="mt-2">
          {loading ? (
            <p className="py-8 text-center text-sm text-neutral-500">
              Loading responses…
            </p>
          ) : comments.length === 0 ? (
            <p className="py-8 text-center text-sm text-neutral-500">
              No responses yet. Be the first to share your thoughts.
            </p>
          ) : (
            comments.map((comment) => (
              <CommentRow
                key={comment.id}
                comment={comment}
                repliesExpanded={expandedRoots.has(comment.id)}
                repliesLoading={loadingReplies.has(comment.id)}
                onToggleReplies={toggleReplies}
                renderReplies={
                  expandedRoots.has(comment.id) ? (
                    <ReplyTree
                      replies={repliesByRoot[comment.id] ?? []}
                      parentId={comment.id}
                      {...rowProps}
                    />
                  ) : undefined
                }
                {...rowProps}
              />
            ))
          )}
        </div>

        {nextCursor && (
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              disabled={loadingMore}
              className="rounded-full border border-neutral-800 px-6 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50 transition-colors disabled:opacity-50"
              onClick={() => void loadMoreComments()}
            >
              {loadingMore ? "Loading…" : "See all responses"}
            </button>
          </div>
        )}
      </section>
    </>
  );
}
