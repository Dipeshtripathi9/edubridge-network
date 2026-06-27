'use client';

import { useState } from 'react';
import { Bookmark, ExternalLink, FileText, Heart, MessageCircle, Send, Share2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Stars } from '@/components/stars';
import { cn, timeAgo } from '@/lib/utils';
import {
  useAddResourceComment,
  useDeleteResource,
  useDownloadResource,
  useRateResource,
  useResourceComments,
  useShareResource,
  useToggleResourceBookmark,
  useToggleResourceLike,
  type Resource,
} from '@/hooks/use-resources';

const TYPE_LABEL: Record<string, string> = {
  NOTES: 'Notes',
  PDF: 'PDF',
  ROADMAP: 'Roadmap',
  PLACEMENT_REPORT: 'Placement Report',
  STUDY_MATERIAL: 'Study Material',
};

export function ResourceCard({
  resource,
  canModerate = false,
}: {
  resource: Resource;
  canModerate?: boolean;
}) {
  const download = useDownloadResource();
  const del = useDeleteResource();
  const rate = useRateResource();
  const bookmark = useToggleResourceBookmark();
  const like = useToggleResourceLike();
  const share = useShareResource();
  const addComment = useAddResourceComment(resource.id);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const comments = useResourceComments(showComments ? resource.id : null);

  const onShare = () => {
    const url = `${window.location.origin}/resources/${resource.id}`;
    navigator.clipboard?.writeText(url).catch(() => {});
    share.mutate(resource.id);
    toast.success('Link copied to clipboard');
  };

  const onDownload = () => {
    download.mutate(resource.id, {
      onSuccess: (res) => {
        if (res.url && res.url.startsWith('http')) {
          window.open(res.url, '_blank', 'noopener,noreferrer');
        } else {
          toast.error('No link available for this resource');
        }
      },
      onError: (e) => toast.error((e as Error).message),
    });
  };

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold">{resource.title}</h3>
            <Badge variant="secondary">{TYPE_LABEL[resource.type] ?? resource.type}</Badge>
          </div>
          {canModerate && (
            <button
              className="shrink-0 text-muted-foreground hover:text-destructive"
              title="Delete resource"
              onClick={() => {
                if (window.confirm('Delete this resource?')) {
                  del.mutate(resource.id, {
                    onSuccess: () => toast.success('Resource deleted'),
                    onError: (e) => toast.error((e as Error).message),
                  });
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {resource.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{resource.description}</p>
        )}

        {resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {resource.tags.slice(0, 4).map((t) => (
              <span key={t} className="text-xs text-primary">
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <Stars value={resource.avgRating} />
          <span className="text-xs text-muted-foreground">
            {resource.avgRating.toFixed(1)} ({resource.ratingCount})
          </span>
        </div>

        <p className="text-xs text-muted-foreground">
          by {resource.uploader.profile?.fullName ?? 'Student'} · {resource.downloadCount} opens ·{' '}
          {timeAgo(resource.createdAt)} ago
        </p>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <Button size="sm" className="flex-1" onClick={onDownload} disabled={download.isPending}>
            <ExternalLink className="h-4 w-4" />
            Open
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              bookmark.mutate(resource.id, {
                onSuccess: (r) => toast.success(r.bookmarked ? 'Bookmarked' : 'Removed'),
              })
            }
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-1 border-t border-border pt-2 text-sm text-muted-foreground">
          <button
            className={cn('flex items-center gap-1 px-1 hover:text-foreground', resource.likedByMe && 'text-rose-500')}
            onClick={() => like.mutate(resource.id)}
          >
            <Heart className={cn('h-4 w-4', resource.likedByMe && 'fill-current')} /> {resource.likeCount}
          </button>
          <button
            className="flex items-center gap-1 px-1 hover:text-foreground"
            onClick={() => setShowComments((v) => !v)}
          >
            <MessageCircle className="h-4 w-4" /> {resource.commentCount}
          </button>
          <button className="flex items-center gap-1 px-1 hover:text-foreground" onClick={onShare}>
            <Share2 className="h-4 w-4" /> {resource.shareCount}
          </button>
        </div>

        {showComments && (
          <div className="space-y-2 border-t border-border pt-2">
            <div className="flex gap-2">
              <Input
                placeholder="Add a comment…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && commentText.trim()) {
                    addComment.mutate(commentText.trim(), { onSuccess: () => setCommentText('') });
                  }
                }}
              />
              <Button
                size="icon"
                disabled={!commentText.trim() || addComment.isPending}
                onClick={() => addComment.mutate(commentText.trim(), { onSuccess: () => setCommentText('') })}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {comments.data?.data.map((c) => (
              <div key={c.id} className="text-sm">
                <span className="font-medium">{c.user.profile?.fullName ?? 'Student'}</span>{' '}
                <span className="text-muted-foreground">{c.body}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 border-t border-border pt-2 text-xs text-muted-foreground">
          Rate:
          {[1, 2, 3, 4, 5].map((v) => (
            <button
              key={v}
              className={cn('px-0.5 hover:text-amber-400')}
              onClick={() =>
                rate.mutate(
                  { id: resource.id, value: v },
                  { onSuccess: () => toast.success(`Rated ${v}★`) },
                )
              }
            >
              {v}★
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
