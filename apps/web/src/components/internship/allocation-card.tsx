'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Briefcase, IndianRupee, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isSafeHttpUrl } from '@/lib/utils';
import { useSubmitTrackBWork, type TrackBApplication } from '@/hooks/use-internship-applications';
import type { StageTrackerStage } from '@/components/internship/stage-tracker';

/** Presentation-layer stage derivation from the real `TrackBApplicationStatus` enum. */
export function deriveTrackBStages(app: TrackBApplication): StageTrackerStage[] {
  // "active" index: how far along the pipeline we are. REJECTED sits back at
  // "submitted" (awaiting a resubmission), not past it.
  const activeIndex =
    app.status === 'PENDING'
      ? 0
      : app.status === 'ALLOCATED'
        ? 1
        : app.status === 'SUBMITTED' || app.status === 'REJECTED'
          ? 2
          : 3; // APPROVED
  const statusFor = (i: number): StageTrackerStage['status'] => {
    if (app.status === 'APPROVED') return 'done';
    if (i < activeIndex) return 'done';
    if (i === activeIndex) return 'active';
    return 'pending';
  };
  return [
    { key: 'applied', label: 'Applied', status: statusFor(0) },
    { key: 'allocated', label: 'Allocated', status: statusFor(1) },
    { key: 'submitted', label: 'Submitted', status: statusFor(2) },
    { key: 'certified', label: 'Certified', status: statusFor(3) },
  ];
}

const ALLOCATION_VISUAL = {
  PAID_CLIENT_WORK: { Icon: Briefcase, label: 'Paid client work', tone: 'bg-marigold-soft text-amber-600' },
  SKILL_BUILDING_TASK: { Icon: Sparkles, label: 'Skill-building task', tone: 'bg-accent text-primary' },
} as const;

export function AllocationCard({ application }: { application: TrackBApplication }) {
  const [submissionUrl, setSubmissionUrl] = useState('');
  const submit = useSubmitTrackBWork();

  const canSubmit = application.status === 'ALLOCATED' || application.status === 'REJECTED';
  const visual = application.allocationType ? ALLOCATION_VISUAL[application.allocationType] : null;

  const onSubmit = () => {
    if (!isSafeHttpUrl(submissionUrl)) {
      toast.error('Enter a valid link (https://...)');
      return;
    }
    submit.mutate(
      { id: application.id, submissionUrl },
      {
        onSuccess: () => {
          toast.success('Work submitted for review');
          setSubmissionUrl('');
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        {application.status === 'PENDING' && (
          <p className="text-sm text-muted-foreground">
            Your application is under review — we&apos;ll allocate you paid client work or a
            skill-building task soon.
          </p>
        )}

        {visual && (
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold ${visual.tone}`}>
              <visual.Icon className="h-3.5 w-3.5" /> {visual.label}
            </span>
            {application.allocationType === 'PAID_CLIENT_WORK' && application.payoutAmount != null && (
              <Badge variant="secondary" className="gap-1">
                <IndianRupee className="h-3 w-3" /> {application.payoutAmount.toLocaleString()} payout
              </Badge>
            )}
            {application.payoutSentAt && <Badge>Payout sent</Badge>}
          </div>
        )}

        {application.allocationNote && (
          <p className="rounded-lg bg-accent/40 px-3 py-2 text-sm text-foreground">{application.allocationNote}</p>
        )}

        {application.status === 'SUBMITTED' && (
          <p className="text-sm text-muted-foreground">
            Submitted — awaiting review.{' '}
            {application.submissionUrl && (
              <a href={application.submissionUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                View submission
              </a>
            )}
          </p>
        )}

        {application.status === 'APPROVED' && (
          <p className="text-sm font-semibold text-primary">Approved — certificate issued 🎉</p>
        )}

        {application.status === 'REJECTED' && application.reviewNote && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
            Needs changes: {application.reviewNote}
          </p>
        )}

        {canSubmit && (
          <div className="space-y-2 border-t border-border pt-3">
            <p className="text-sm font-semibold">
              {application.status === 'REJECTED' ? 'Resubmit your work' : 'Submit your work'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="Link to your work (repo, doc, drive, deployed URL...)"
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
                className="flex-1"
              />
              <Button disabled={submit.isPending || !submissionUrl.trim()} onClick={onSubmit}>
                Submit
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
