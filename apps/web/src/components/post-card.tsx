'use client';

import { useState } from 'react';
import { Bookmark, Flag, Heart, MessageCircle, Pin, Send, Share2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { VerifiedBadge } from '@/components/verified-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, timeAgo } from '@/lib/utils';
import {
  type Post,
  useAddComment,
  useComments,
  useDeletePost,
  usePinPost,
  useSharePost,
  useToggleBookmark,
  useToggleLike,
  useVotePoll,
} from '@/hooks/use-posts';
import { useCreateReport } from '@/hooks/use-admin';

export function PostCard({
  post,
  slug,
  canModerate = false,
}: {
  post: Post;
  slug: string;
  canModerate?: boolean;
}) {
  const like = useToggleLike(slug);
  const bookmark = useToggleBookmark(slug);
  const share = useSharePost(slug);

  const onShare = () => {
    const url = `${window.location.origin}/communities/${slug}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    share.mutate(post.id);
    toast.success('Link copied to clipboard');
  };
  const vote = useVotePoll(slug);
  const pin = usePinPost(slug);
  const del = useDeletePost(slug);

  // Comments stay collapsed until the reader clicks the comment button.
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const comments = useComments(showComments ? post.id : null);
  const addComment = useAddComment(post.id);
  const report = useCreateReport();

  const onReport = () => {
    const reason = window.prompt('Why are you reporting this post?');
    if (!reason) return;
    report.mutate(
      { targetType: 'POST', targetId: post.id, reportedUserId: post.author.id, reason },
      {
        onSuccess: () => toast.success('Reported — our team will review it'),
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  const totalVotes = post.poll?.options.reduce((s, o) => s + o.voteCount, 0) ?? 0;

  return (
    <div className="animate-page">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <Avatar src={post.author.profile?.avatarUrl} name={post.author.profile?.fullName} />
            <div>
              <p className="flex items-center gap-1 text-sm font-medium">
                {post.author.profile?.fullName ?? 'Student'}
                {post.author.profile?.collegeVerification === 'VERIFIED' && (
                  <VerifiedBadge college={post.author.profile?.college?.name} />
                )}
              </p>
              <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)} ago</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              {post.isPinned && (
                <span className="flex items-center gap-1 text-xs font-medium text-primary">
                  <Pin className="h-3.5 w-3.5" /> Pinned
                </span>
              )}
              {post.type !== 'TEXT' && (
                <Badge variant="secondary" className="capitalize">
                  {post.type.toLowerCase()}
                </Badge>
              )}
            </div>
          </div>

          {post.title && <h3 className="mt-3 font-semibold">{post.title}</h3>}
          <p className="mt-2 whitespace-pre-wrap text-sm">{post.body}</p>

          {post.poll && (
            <div className="mt-4 space-y-2">
              {post.poll.options.map((opt) => {
                const pct = totalVotes ? Math.round((opt.voteCount / totalVotes) * 100) : 0;
                return (
                  <button
                    key={opt.id}
                    onClick={() => vote.mutate({ postId: post.id, optionIds: [opt.id] })}
                    className="relative w-full overflow-hidden rounded-md border border-border p-2 text-left text-sm"
                  >
                    <span
                      className="absolute inset-y-0 left-0 bg-primary/10"
                      style={{ width: `${pct}%` }}
                    />
                    <span className="relative flex justify-between">
                      <span>{opt.text}</span>
                      <span className="text-muted-foreground">{pct}%</span>
                    </span>
                  </button>
                );
              })}
              <p className="text-xs text-muted-foreground">{totalVotes} votes</p>
            </div>
          )}

          {post.hashtags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.hashtags.map((t) => (
                <span key={t} className="text-xs text-primary">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
            <button
              className={cn('flex items-center gap-1.5 hover:text-primary', post.likedByMe && 'text-primary')}
              onClick={() => like.mutate(post.id)}
            >
              <Heart className={cn('h-4 w-4', post.likedByMe && 'fill-current')} />
              {post.likeCount}
            </button>
            <button
              className={cn('flex items-center gap-1.5 hover:text-primary', showComments && 'text-primary')}
              onClick={() => setShowComments((v) => !v)}
              title="Comments"
            >
              <MessageCircle className="h-4 w-4" />
              {post.commentCount}
            </button>
            <button
              className={cn('flex items-center gap-1.5 hover:text-primary', post.savedByMe && 'text-primary')}
              onClick={() => bookmark.mutate(post.id)}
            >
              <Bookmark className={cn('h-4 w-4', post.savedByMe && 'fill-current')} />
              {post.saveCount}
            </button>
            <button className="flex items-center gap-1.5 hover:text-primary" onClick={onShare} title="Share">
              <Share2 className="h-4 w-4" />
              {post.shareCount}
            </button>
            {canModerate && (
              <button
                className={cn('ml-auto flex items-center gap-1.5 hover:text-primary', post.isPinned && 'text-primary')}
                onClick={() => pin.mutate(post.id)}
                aria-label="Pin post"
                title={post.isPinned ? 'Unpin' : 'Pin'}
              >
                <Pin className="h-4 w-4" />
              </button>
            )}
            <button
              className={cn('flex items-center gap-1.5 hover:text-destructive', !canModerate && 'ml-auto')}
              onClick={onReport}
              aria-label="Report post"
              title="Report this post"
            >
              <Flag className="h-4 w-4" />
            </button>
            {canModerate && (
              <button
                className="flex items-center gap-1.5 hover:text-destructive"
                onClick={() => {
                  if (window.confirm('Delete this post?')) {
                    del.mutate(post.id, {
                      onSuccess: () => toast.success('Post deleted'),
                      onError: (e: unknown) => toast.error((e as Error).message),
                    });
                  }
                }}
                aria-label="Delete post"
                title="Delete post"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {showComments && (
            <div className="mt-3 space-y-3 border-t border-border pt-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a comment…"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && commentText.trim()) {
                      addComment.mutate(
                        { body: commentText.trim() },
                        { onSuccess: () => setCommentText('') },
                      );
                    }
                  }}
                />
                <Button
                  size="icon"
                  disabled={!commentText.trim() || addComment.isPending}
                  onClick={() =>
                    addComment.mutate(
                      { body: commentText.trim() },
                      { onSuccess: () => setCommentText('') },
                    )
                  }
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {comments.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading comments…</p>
              ) : comments.data && comments.data.data.length > 0 ? (
                comments.data.data.map((c) => (
                  <div key={c.id} className="text-sm">
                    <span className="inline-flex items-center gap-1 font-medium align-middle">
                      {c.author.profile?.fullName ?? 'Student'}
                      {c.author.profile?.collegeVerification === 'VERIFIED' && (
                        <VerifiedBadge college={c.author.profile?.college?.name} size="xs" />
                      )}
                    </span>{' '}
                    <span className="text-muted-foreground">{c.body}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No comments yet — be the first.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
