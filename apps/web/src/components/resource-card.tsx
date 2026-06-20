'use client';

import { Bookmark, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Stars } from '@/components/stars';
import { cn, timeAgo } from '@/lib/utils';
import {
  useDownloadResource,
  useRateResource,
  useToggleResourceBookmark,
  type Resource,
} from '@/hooks/use-resources';

const TYPE_LABEL: Record<string, string> = {
  NOTES: 'Notes',
  PDF: 'PDF',
  ROADMAP: 'Roadmap',
  PLACEMENT_REPORT: 'Placement Report',
  STUDY_MATERIAL: 'Study Material',
};

export function ResourceCard({ resource }: { resource: Resource }) {
  const download = useDownloadResource();
  const rate = useRateResource();
  const bookmark = useToggleResourceBookmark();

  const onDownload = () => {
    download.mutate(resource.id, {
      onSuccess: (res) => {
        if (res.configured && res.url.startsWith('http')) {
          window.open(res.url, '_blank');
        } else {
          toast.success('Download recorded (S3 not configured in this environment)');
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
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{resource.title}</h3>
            <Badge variant="secondary">{TYPE_LABEL[resource.type] ?? resource.type}</Badge>
          </div>
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
          by {resource.uploader.profile?.fullName ?? 'Student'} · {resource.downloadCount} downloads ·{' '}
          {timeAgo(resource.createdAt)} ago
        </p>

        <div className="mt-auto flex items-center gap-2 pt-2">
          <Button size="sm" className="flex-1" onClick={onDownload} disabled={download.isPending}>
            <Download className="h-4 w-4" />
            Download
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
