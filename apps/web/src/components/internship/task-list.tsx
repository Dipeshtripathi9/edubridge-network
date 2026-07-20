'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isSafeHttpUrl } from '@/lib/utils';
import { useSubmitTaskWork, type EnrollmentTask } from '@/hooks/use-internships';
import type { StageTrackerStage } from '@/components/internship/stage-tracker';

const TASK_VISUAL: Record<EnrollmentTask['status'], { Icon: typeof Circle; label: string; tone: string }> = {
  ASSIGNED: { Icon: Circle, label: 'Awaiting submission', tone: 'text-muted-foreground' },
  SUBMITTED: { Icon: Clock, label: 'Under review', tone: 'text-marigold' },
  APPROVED: { Icon: CheckCircle2, label: 'Approved', tone: 'text-green' },
  REJECTED: { Icon: XCircle, label: 'Needs changes', tone: 'text-destructive' },
};

function TaskRow({ task }: { task: EnrollmentTask }) {
  const [url, setUrl] = useState(task.submissionUrl ?? '');
  const submit = useSubmitTaskWork();
  const visual = TASK_VISUAL[task.status];
  const canSubmit = task.status === 'ASSIGNED' || task.status === 'REJECTED';

  const onSubmit = () => {
    if (!isSafeHttpUrl(url)) {
      toast.error('Enter a valid link (https://...)');
      return;
    }
    submit.mutate(
      { taskId: task.id, submissionUrl: url },
      {
        onSuccess: () => toast.success('Task submitted for review'),
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold">{task.title}</p>
            {task.description && <p className="text-sm text-muted-foreground">{task.description}</p>}
          </div>
          <Badge variant="secondary" className={`gap-1 ${visual.tone}`}>
            <visual.Icon className="h-3 w-3" /> {visual.label}
          </Badge>
        </div>

        {task.status === 'REJECTED' && task.reviewNote && (
          <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{task.reviewNote}</p>
        )}
        {task.status === 'APPROVED' && task.reviewNote && (
          <p className="rounded-lg bg-green-soft px-3 py-2 text-sm text-green">{task.reviewNote}</p>
        )}
        {task.status === 'SUBMITTED' && task.submissionUrl && (
          <p className="text-sm text-muted-foreground">
            Submitted:{' '}
            <a href={task.submissionUrl} target="_blank" rel="noreferrer" className="text-primary underline">
              {task.submissionUrl}
            </a>
          </p>
        )}

        {canSubmit && (
          <div className="flex flex-wrap gap-2 pt-1">
            <Input
              placeholder="Link to your work"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button size="sm" disabled={submit.isPending || !url.trim()} onClick={onSubmit}>
              {task.status === 'REJECTED' ? 'Resubmit' : 'Submit'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function TaskList({ tasks }: { tasks: EnrollmentTask[] }) {
  if (tasks.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-foreground">No tasks assigned yet — your mentor will add the first one soon.</p>;
  }
  return (
    <div className="space-y-3">
      {tasks.map((t) => (
        <TaskRow key={t.id} task={t} />
      ))}
    </div>
  );
}

/** Presentation-layer stage derivation for Track A, from `EnrollmentStatus` + task progress. */
export function deriveTrackAStages(status: string, tasks: EnrollmentTask[]): StageTrackerStage[] {
  const allApproved = tasks.length > 0 && tasks.every((t) => t.status === 'APPROVED');
  const anyInProgress = tasks.length > 0 && tasks.some((t) => t.status !== 'APPROVED');

  const stageStatus = (key: 'payment' | 'started' | 'progress' | 'complete'): StageTrackerStage['status'] => {
    if (status === 'COMPLETED') return 'done';
    if (status === 'CANCELLED') return key === 'payment' ? 'done' : 'pending';
    if (status === 'PENDING_PAYMENT') return key === 'payment' ? 'active' : 'pending';
    // ACTIVE
    if (key === 'payment') return 'done';
    if (key === 'started') return tasks.length === 0 ? 'active' : 'done';
    if (key === 'progress') return anyInProgress ? 'active' : tasks.length > 0 ? 'done' : 'pending';
    if (key === 'complete') return allApproved ? 'active' : 'pending';
    return 'pending';
  };

  return [
    { key: 'payment', label: 'Payment', status: stageStatus('payment') },
    { key: 'started', label: 'Tasks assigned', status: stageStatus('started') },
    { key: 'progress', label: 'In progress', status: stageStatus('progress') },
    { key: 'complete', label: 'Completed', status: stageStatus('complete') },
  ];
}
