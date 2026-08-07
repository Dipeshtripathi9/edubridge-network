'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown, CircleDashed, ExternalLink, Github, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
  useMyVirtualInternshipTaskSubmissions,
  useSubmitVirtualInternshipTask,
  useVirtualInternshipTasks,
  type VirtualInternshipEnrollment,
  type VirtualInternshipTask,
  type VirtualInternshipTaskSubmission,
} from '@/hooks/use-virtual-internship';

function statusBadge(submission: VirtualInternshipTaskSubmission | undefined) {
  if (!submission) return null;
  if (submission.status === 'APPROVED') {
    return (
      <Badge variant="outline" className="border-green text-green">
        Approved
      </Badge>
    );
  }
  if (submission.status === 'REJECTED') {
    return (
      <Badge variant="outline" className="border-destructive text-destructive">
        Needs changes
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-marigold text-marigold">
      Submitted
    </Badge>
  );
}

function TaskPanel({
  task,
  submission,
  open,
  onToggle,
  numberLabel,
}: {
  task: VirtualInternshipTask;
  submission: VirtualInternshipTaskSubmission | undefined;
  open: boolean;
  onToggle: () => void;
  numberLabel: string | number;
}) {
  const [githubUrl, setGithubUrl] = useState(submission?.githubUrl ?? '');
  const submitTask = useSubmitVirtualInternshipTask();

  const onSubmit = () => {
    if (!githubUrl.trim()) {
      toast.error('Paste your GitHub repo link');
      return;
    }
    submitTask.mutate(
      { taskId: task.id, githubUrl: githubUrl.trim() },
      {
        onSuccess: () => toast.success('Submitted — your mentor will review it soon'),
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  const approved = submission?.status === 'APPROVED';

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border transition-colors',
        open ? 'border-green' : 'border-border',
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'flex w-full items-center gap-3 p-4 text-left',
          open && 'bg-green-soft/40',
        )}
      >
        <span
          className={cn(
            'grid h-8 w-8 flex-none place-items-center rounded-full font-display text-sm font-bold',
            approved ? 'bg-green text-white' : 'bg-accent text-muted-foreground',
          )}
        >
          {numberLabel}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-sm font-semibold">{task.title}</span>
          <span className="block text-xs text-muted-foreground">{task.hours}</span>
        </span>
        {statusBadge(submission)}
        <ChevronDown className={cn('h-4 w-4 flex-none text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="space-y-4 border-t border-border p-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Task objective</p>
            <p className="mt-1 text-sm">{task.objective}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Expected deliverable</p>
            <p className="mt-1 text-sm">{task.deliverable}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Key steps</p>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-sm">
              {task.steps.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-muted-foreground">Estimated effort: {task.hours}</p>

          {submission?.status === 'REJECTED' && submission.reviewNote && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm">
              <p className="font-semibold text-destructive">Mentor feedback</p>
              <p className="mt-0.5 text-muted-foreground">{submission.reviewNote}</p>
            </div>
          )}

          {approved ? (
            <div className="flex items-center gap-2 rounded-xl border border-green/40 bg-green-soft/40 p-3 text-sm">
              <ShieldCheck className="h-4 w-4 flex-none text-green" />
              <span className="flex-1">Approved by your mentor.</span>
              <a
                href={submission.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-green hover:underline"
              >
                View repo <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold">Submit your work</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Paste the GitHub repo link for this task so your mentor can review it.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Input
                  placeholder="https://github.com/your-username/your-repo"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="flex-1"
                />
                <Button disabled={submitTask.isPending || !githubUrl.trim()} onClick={onSubmit}>
                  <Github className="h-4 w-4" />
                  {submission ? 'Update submission' : 'Submit'}
                </Button>
              </div>
              {submission?.status === 'SUBMITTED' && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Submitted on {new Date(submission.createdAt).toLocaleDateString()} — awaiting mentor review.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function VirtualInternshipTaskBoard({ enrollment }: { enrollment: VirtualInternshipEnrollment }) {
  const { data: tasks, isLoading: tasksLoading } = useVirtualInternshipTasks(enrollment.track);
  const { data: submissions, isLoading: submissionsLoading } = useMyVirtualInternshipTaskSubmissions(enrollment.id);

  const [openMonth, setOpenMonth] = useState<number | null>(1);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const submissionByTaskId = useMemo(() => {
    const map = new Map<string, VirtualInternshipTaskSubmission>();
    (submissions ?? []).forEach((s) => map.set(s.taskId, s));
    return map;
  }, [submissions]);

  const isDone = (taskId: string) => {
    const s = submissionByTaskId.get(taskId);
    return s?.status === 'SUBMITTED' || s?.status === 'APPROVED';
  };

  if (tasksLoading || submissionsLoading) return <Skeleton className="h-64 w-full" />;
  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground">
          Your track schedule is being finalized — check back shortly.
        </CardContent>
      </Card>
    );
  }

  const isMonthTrack = tasks.some((t) => t.monthNum !== null);
  const totalTasks = tasks.length;
  const totalDone = tasks.filter((t) => isDone(t.id)).length;
  const totalApproved = tasks.filter((t) => submissionByTaskId.get(t.id)?.status === 'APPROVED').length;
  const overallPct = totalTasks ? Math.round((totalDone / totalTasks) * 100) : 0;

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-display text-lg font-bold leading-tight">Track schedule</p>
            <p className="text-sm text-muted-foreground">
              {totalDone}/{totalTasks} tasks submitted · {totalApproved} approved
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-green">
            <CircleDashed className="h-4 w-4" />
            {overallPct}% complete
          </div>
        </div>

        {isMonthTrack ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((monthNum) => {
              const monthTasks = tasks.filter((t) => t.monthNum === monthNum).sort((a, b) => a.weekNum - b.weekNum);
              if (monthTasks.length === 0) return null;
              const monthDone = monthTasks.filter((t) => isDone(t.id)).length;
              const monthPct = Math.round((monthDone / monthTasks.length) * 100);
              const open = openMonth === monthNum;
              return (
                <div key={monthNum} className={cn('overflow-hidden rounded-2xl border', open ? 'border-green' : 'border-border')}>
                  <button
                    type="button"
                    onClick={() => setOpenMonth(open ? null : monthNum)}
                    className={cn('flex w-full items-center gap-3 p-4 text-left', open && 'bg-green-soft/40')}
                  >
                    <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-green font-display text-sm font-bold text-white">
                      M{monthNum}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-sm font-semibold">
                        Month {monthNum} — {monthTasks[0]?.monthTitle ?? ''}
                      </span>
                      <span className="block text-xs text-muted-foreground">{monthTasks[0]?.monthDesc ?? ''}</span>
                    </span>
                    <span className="flex-none text-xs font-bold text-green">{monthPct}%</span>
                    <ChevronDown className={cn('h-4 w-4 flex-none text-muted-foreground transition-transform', open && 'rotate-180')} />
                  </button>
                  {open && (
                    <div className="space-y-2.5 border-t border-border p-3">
                      {monthTasks.map((t, i) => (
                        <TaskPanel
                          key={t.id}
                          task={t}
                          submission={submissionByTaskId.get(t.id)}
                          open={openTaskId === t.id}
                          onToggle={() => setOpenTaskId(openTaskId === t.id ? null : t.id)}
                          numberLabel={i + 1}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2.5">
            {tasks
              .sort((a, b) => a.weekNum - b.weekNum)
              .map((t, i) => (
                <TaskPanel
                  key={t.id}
                  task={t}
                  submission={submissionByTaskId.get(t.id)}
                  open={openTaskId === t.id}
                  onToggle={() => setOpenTaskId(openTaskId === t.id ? null : t.id)}
                  numberLabel={i + 1}
                />
              ))}
          </div>
        )}

        <p className="border-t border-border pt-3 text-xs text-muted-foreground">
          Your certificate and letter of recommendation are issued once your mentor confirms your final project —
          keep submitting each task as you go.
        </p>
      </CardContent>
    </Card>
  );
}
