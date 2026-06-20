'use client';

import { Bookmark, Flag, Heart, MessageCircle, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn, timeAgo } from '@/lib/utils';
import {
  type Post,
  useToggleBookmark,
  useToggleLike,
  useVotePoll,
} from '@/hooks/use-posts';
import { useCreateReport } from '@/hooks/use-admin';

export function PostCard({ post, slug }: { post: Post; slug: string }) {
  const like = useToggleLike(slug);
  const bookmark = useToggleBookmark(slug);
  const vote = useVotePoll(slug);
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
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-3">
            <Avatar src={post.author.profile?.avatarUrl} name={post.author.profile?.fullName} />
            <div>
              <p className="text-sm font-medium">{post.author.profile?.fullName ?? 'Student'}</p>
              <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)} ago</p>
            </div>
            {post.type !== 'TEXT' && (
              <Badge variant="secondary" className="ml-auto capitalize">
                {post.type.toLowerCase()}
              </Badge>
            )}
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
            <span className="flex items-center gap-1.5">
              <MessageCircle className="h-4 w-4" />
              {post.commentCount}
            </span>
            <button
              className={cn('flex items-center gap-1.5 hover:text-primary', post.savedByMe && 'text-primary')}
              onClick={() => bookmark.mutate(post.id)}
            >
              <Bookmark className={cn('h-4 w-4', post.savedByMe && 'fill-current')} />
              {post.saveCount}
            </button>
            <span className="flex items-center gap-1.5">
              <Share2 className="h-4 w-4" />
              {post.shareCount}
            </span>
            <button
              className="ml-auto flex items-center gap-1.5 hover:text-destructive"
              onClick={onReport}
              aria-label="Report post"
            >
              <Flag className="h-4 w-4" />
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
