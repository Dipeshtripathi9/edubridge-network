'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, ExternalLink, Github, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterChips } from '@/components/ui/filter-chips';
import { EmptyState } from '@/components/ui/empty-state';
import {
  useAdminVirtualInternshipSubmissions,
  useReviewVirtualInternshipSubmission,
  type VirtualInternshipTaskSubmission,
  type VirtualInternshipTaskSubmissionStatus,
} from '@/hooks/use-virtual-internship';

const STATUSES: { value: VirtualInternshipTaskSubmissionStatus | 'ALL'; label: string }[] = [
  { value: 'SUBMITTED', label: 'Awaiting review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Needs changes' },
  { value: 'ALL', label: 'All' },
];

function SubmissionRow({ submission }: { submission: VirtualInternshipTaskSubmission }) {
  const [note, setNote] = useState('');
  const review = useReviewVirtualInternshipSubmission();

  const onReview = (status: 'APPROVED' | 'REJECTED') => {
    review.mutate(
      { id: submission.id, status, reviewNote: note.trim() || undefined },
      {
        onSuccess: () => toast.success(status === 'APPROVED' ? 'Submission approved' : 'Sent back for changes'),
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-semibold">{submission.user?.profile?.fullName ?? 'Unknown student'}</p>
            <p className="text-xs text-muted-foreground">
              {submission.user?.email} {submission.user?.phone && `· ${submission.user.phone}`}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {submission.task?.monthNum ? `Month ${submission.task.monthNum} · ` : ''}Week {submission.task?.weekNum} —{' '}
              {submission.task?.title}
            </p>
          </div>
          <Badge
            variant="outline"
            className={
              submission.status === 'APPROVED'
                ? 'border-green text-green'
                : submission.status === 'REJECTED'
                  ? 'border-destructive text-destructive'
                  : 'border-marigold text-marigold'
            }
          >
            {submission.status === 'SUBMITTED' ? 'Awaiting review' : submission.status === 'APPROVED' ? 'Approved' : 'Needs changes'}
          </Badge>
        </div>

        <a
          href={submission.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          <Github className="h-4 w-4" /> {submission.githubUrl} <ExternalLink className="h-3.5 w-3.5" />
        </a>

        {submission.reviewNote && (
          <p className="text-xs text-muted-foreground">Previous note: {submission.reviewNote}</p>
        )}

        {submission.status === 'SUBMITTED' && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <Input
              placeholder="Note for the student (optional, useful if rejecting)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-w-[220px] flex-1"
            />
            <Button size="sm" disabled={review.isPending} onClick={() => onReview('APPROVED')}>
              <CheckCircle2 className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button size="sm" variant="outline" disabled={review.isPending} onClick={() => onReview('REJECTED')}>
              <XCircle className="h-3.5 w-3.5" /> Request changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function VirtualInternshipSubmissionsReview() {
  const [status, setStatus] = useState<VirtualInternshipTaskSubmissionStatus | 'ALL'>('SUBMITTED');
  const { data, isLoading } = useAdminVirtualInternshipSubmissions(status === 'ALL' ? undefined : status);

  return (
    <div className="space-y-4">
      <FilterChips options={STATUSES} value={status} onChange={setStatus} />
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !data?.data.length ? (
        <EmptyState icon={Github} title="No submissions" description="No task submissions match this filter." />
      ) : (
        <div className="space-y-3">
          {data.data.map((submission) => (
            <SubmissionRow key={submission.id} submission={submission} />
          ))}
        </div>
      )}
    </div>
  );
}
