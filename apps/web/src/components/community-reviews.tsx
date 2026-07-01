'use client';

import { useState } from 'react';
import { BadgeCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { VerifiedBadge } from '@/components/verified-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Stars } from '@/components/stars';
import {
  useCommunityReviewSummary,
  useCommunityReviews,
  useCreateCommunityReview,
} from '@/hooks/use-reviews';

/** Reviews of a community's managers/leadership — available on every community. */
export function CommunityReviews({ slug, canReview }: { slug: string; canReview: boolean }) {
  const { data: summary } = useCommunityReviewSummary(slug);
  const { data, isLoading } = useCommunityReviews(slug);
  const create = useCreateCommunityReview(slug);
  const reviews = data?.data ?? [];

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const submit = () => {
    if (!body.trim()) {
      toast.error('Write a few words');
      return;
    }
    create.mutate(
      { rating, title: title || undefined, body },
      {
        onSuccess: () => {
          toast.success('Review submitted');
          setOpen(false);
          setTitle('');
          setBody('');
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Community managers</p>
          {summary && summary.count > 0 ? (
            <div className="flex items-center gap-2">
              <Stars value={summary.avgRating} />
              <span className="text-sm text-muted-foreground">
                {summary.avgRating.toFixed(1)} ({summary.count})
              </span>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No manager reviews yet.</p>
          )}
        </div>
        {canReview && !open && <Button size="sm" onClick={() => setOpen(true)}>Write a review</Button>}
      </div>

      {open && (
        <Card>
          <CardContent className="space-y-2 p-4">
            <label className="flex items-center gap-2 text-sm">
              Rating
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="h-9 rounded-md border border-input bg-background px-2 text-sm"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} ★
                  </option>
                ))}
              </select>
            </label>
            <Input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea
              placeholder="How are the community heads/moderators doing?"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={create.isPending}>
                Submit
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : reviews.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">Be the first to review the managers.</p>
      ) : (
        reviews.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Stars value={r.rating} />
                {r.isVerified && (
                  <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                    <BadgeCheck className="h-3.5 w-3.5" /> Verified
                  </span>
                )}
              </div>
              {r.title && <p className="mt-1 font-medium">{r.title}</p>}
              <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                — {r.author?.profile?.fullName ?? 'Member'}
                {r.author?.profile?.collegeVerification === 'VERIFIED' && (
                  <VerifiedBadge college={r.author?.profile?.college?.name} size="xs" />
                )}
              </p>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
