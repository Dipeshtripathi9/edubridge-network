'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BadgeCheck, ChevronUp, PenLine } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Stars, StarInput } from '@/components/stars';
import { cn, timeAgo } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useCollege } from '@/hooks/use-colleges';
import {
  useCreateReview,
  useReviewSummary,
  useReviews,
  useVerifyReview,
  useVoteReview,
  type Review,
} from '@/hooks/use-reviews';

const CATEGORIES = [
  { value: 'PLACEMENT', label: 'Placement' },
  { value: 'HOSTEL', label: 'Hostel' },
  { value: 'FACULTY', label: 'Faculty' },
  { value: 'CAMPUS_LIFE', label: 'Campus Life' },
];

function WriteReview({ collegeId }: { collegeId: string }) {
  const create = useCreateReview(collegeId);
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('PLACEMENT');
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const submit = () => {
    if (!rating || !body.trim()) {
      toast.error('Add a rating and your review');
      return;
    }
    create.mutate(
      { category, rating, title: title || undefined, body },
      {
        onSuccess: () => {
          toast.success('Review posted');
          setOpen(false);
          setRating(0);
          setTitle('');
          setBody('');
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <PenLine className="h-4 w-4" />
        Write a review
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a review</CardTitle>
        <p className="text-xs text-muted-foreground">
          Only verified students of this college can post — your review will be marked verified.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-sm',
                category === c.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:bg-accent',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <StarInput value={rating} onChange={setRating} />
        <Input placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea
          placeholder="Share your honest experience…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={create.isPending}>
            {create.isPending ? 'Posting…' : 'Post review'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ReviewItem({ review, collegeId }: { review: Review; collegeId: string }) {
  const vote = useVoteReview(collegeId);
  const verify = useVerifyReview(collegeId);
  const globalRole = useAuthStore((s) => s.user?.role);
  const canModerate =
    globalRole === 'ADMIN' || globalRole === 'SUPER_ADMIN' || globalRole === 'MODERATOR';
  return (
    <Card>
      <CardContent className="flex gap-4 p-5">
        <div className="flex flex-col items-center">
          <button
            onClick={() => vote.mutate({ id: review.id, value: review.myVote === 1 ? -1 : 1 })}
            className={cn(
              'rounded-md p-1 hover:bg-accent',
              review.myVote === 1 && 'text-primary',
            )}
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium">{review.upvotes - review.downvotes}</span>
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Stars value={review.rating} />
            <Badge variant="secondary" className="capitalize">
              {review.category.replace('_', ' ').toLowerCase()}
            </Badge>
            {review.isVerified && (
              <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified student
              </span>
            )}
            {canModerate && (
              <button
                onClick={() => verify.mutate(review.id)}
                className="ml-auto text-xs text-primary hover:underline"
              >
                {review.isVerified ? 'Unverify' : 'Verify'}
              </button>
            )}
          </div>
          {review.title && <h4 className="mt-2 font-semibold">{review.title}</h4>}
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{review.body}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            {review.author.profile?.fullName ?? 'Student'}
            {review.author.profile?.branch ? ` · ${review.author.profile.branch}` : ''} ·{' '}
            {timeAgo(review.createdAt)} ago
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CollegeReviewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: college, isLoading } = useCollege(slug);
  const { data: summary } = useReviewSummary(college?.id);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [sort, setSort] = useState('top');
  const { data: reviewsData, isLoading: reviewsLoading } = useReviews(college?.id, {
    category,
    sort,
  });
  const reviews = reviewsData?.data ?? [];

  if (isLoading) return <Skeleton className="mx-auto h-64 max-w-4xl" />;
  if (!college) return <p className="py-16 text-center text-muted-foreground">College not found.</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/reviews" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> All colleges
      </Link>

      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{college.name}</h1>
            <p className="text-sm text-muted-foreground">
              {[college.city, college.state].filter(Boolean).join(', ')}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Stars value={summary?.overall.avgRating ?? college.avgRating} />
              <span className="font-semibold">
                {(summary?.overall.avgRating ?? college.avgRating).toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                ({summary?.overall.count ?? college.reviewCount} reviews)
              </span>
            </div>
          </div>
          <WriteReview collegeId={college.id} />
        </CardContent>
      </Card>

      {summary && summary.categories.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summary.categories.map((c) => (
            <Card key={c.category}>
              <CardContent className="p-4 text-center">
                <p className="text-xs capitalize text-muted-foreground">
                  {c.category.replace('_', ' ').toLowerCase()}
                </p>
                <p className="text-xl font-bold">{c.avgRating.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">{c.count} reviews</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory(undefined)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm',
              !category ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent',
            )}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-sm',
                category === c.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:bg-accent',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="top">Top</option>
          <option value="recent">Recent</option>
        </select>
      </div>

      {reviewsLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : reviews.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">
          No reviews yet. Be the first verified student to review.
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <ReviewItem key={r.id} review={r} collegeId={college.id} />
          ))}
        </div>
      )}
    </div>
  );
}
