'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  useAssignTask,
  useConfirmPayment,
  useMarkTrackAComplete,
  useReviewTaskSubmission,
  type TrackAEnrollment,
} from '@/hooks/use-internships';
import {
  useAllocateTrackBWork,
  useMarkPayoutSent,
  useReviewTrackBSubmission,
  type TrackBAllocationType,
  type TrackBApplication,
} from '@/hooks/use-internship-applications';

function InlinePanel({
  label,
  open,
  onToggle,
  children,
  variant = 'outline',
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  variant?: 'outline' | 'default';
}) {
  return (
    <div>
      <Button size="sm" variant={variant} onClick={onToggle}>
        {label} {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </Button>
      {open && <div className="mt-2 space-y-2 rounded-xl border border-border bg-accent/20 p-3">{children}</div>}
    </div>
  );
}

// ---------------- Track A ----------------

export function TrackAAdminActions({ enrollment }: { enrollment: TrackAEnrollment }) {
  const [panel, setPanel] = useState<'confirm' | 'assign' | null>(null);
  const [mentorNote, setMentorNote] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  const confirmPayment = useConfirmPayment();
  const assignTask = useAssignTask();
  const reviewTask = useReviewTaskSubmission();
  const complete = useMarkTrackAComplete();

  const tasks = enrollment.tasks ?? [];
  const submittedTasks = tasks.filter((t) => t.status === 'SUBMITTED');
  const allApproved = tasks.length > 0 && tasks.every((t) => t.status === 'APPROVED');

  const togglePanel = (p: 'confirm' | 'assign') => setPanel((cur) => (cur === p ? null : p));

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {enrollment.status === 'PENDING_PAYMENT' && (
          <InlinePanel label="Confirm payment" open={panel === 'confirm'} onToggle={() => togglePanel('confirm')} variant="default">
            <Textarea
              placeholder="Optional mentor note"
              value={mentorNote}
              onChange={(e) => setMentorNote(e.target.value)}
            />
            <Button
              size="sm"
              disabled={confirmPayment.isPending}
              onClick={() =>
                confirmPayment.mutate(
                  { id: enrollment.id, mentorNote: mentorNote.trim() || undefined },
                  {
                    onSuccess: () => {
                      toast.success('Payment confirmed');
                      setPanel(null);
                    },
                    onError: (e) => toast.error((e as Error).message),
                  },
                )
              }
            >
              Confirm
            </Button>
          </InlinePanel>
        )}

        {enrollment.status === 'ACTIVE' && (
          <InlinePanel label="Assign task" open={panel === 'assign'} onToggle={() => togglePanel('assign')}>
            <Input placeholder="Task title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
            <Textarea
              placeholder="Description (optional)"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
            <Button
              size="sm"
              disabled={assignTask.isPending || !taskTitle.trim()}
              onClick={() =>
                assignTask.mutate(
                  { id: enrollment.id, title: taskTitle.trim(), description: taskDescription.trim() || undefined },
                  {
                    onSuccess: () => {
                      toast.success('Task assigned');
                      setTaskTitle('');
                      setTaskDescription('');
                      setPanel(null);
                    },
                    onError: (e) => toast.error((e as Error).message),
                  },
                )
              }
            >
              Assign
            </Button>
          </InlinePanel>
        )}

        {enrollment.status === 'ACTIVE' && allApproved && (
          <Button
            size="sm"
            disabled={complete.isPending}
            onClick={() =>
              complete.mutate(enrollment.id, {
                onSuccess: () => toast.success('Enrollment marked complete — certificate issued'),
                onError: (e) => toast.error((e as Error).message),
              })
            }
          >
            Mark complete
          </Button>
        )}
      </div>

      {submittedTasks.length > 0 && (
        <div className="space-y-2 border-t border-border pt-2">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Tasks awaiting review</p>
          {submittedTasks.map((task) => (
            <TaskReviewRow key={task.id} taskId={task.id} title={task.title} reviewTask={reviewTask} />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskReviewRow({
  taskId,
  title,
  reviewTask,
}: {
  taskId: string;
  title: string;
  reviewTask: ReturnType<typeof useReviewTaskSubmission>;
}) {
  const [note, setNote] = useState('');
  return (
    <div className="rounded-lg border border-border bg-background p-2.5">
      <p className="text-sm font-semibold">{title}</p>
      <Input
        placeholder="Review note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="mt-1.5 h-8 text-xs"
      />
      <div className="mt-1.5 flex gap-2">
        <Button
          size="sm"
          disabled={reviewTask.isPending}
          onClick={() =>
            reviewTask.mutate(
              { taskId, approve: true, reviewNote: note.trim() || undefined },
              { onSuccess: () => toast.success('Task approved'), onError: (e) => toast.error((e as Error).message) },
            )
          }
        >
          <Check className="h-3.5 w-3.5" /> Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={reviewTask.isPending}
          onClick={() =>
            reviewTask.mutate(
              { taskId, approve: false, reviewNote: note.trim() || undefined },
              { onSuccess: () => toast.success('Task sent back for changes'), onError: (e) => toast.error((e as Error).message) },
            )
          }
        >
          <X className="h-3.5 w-3.5" /> Reject
        </Button>
      </div>
    </div>
  );
}

// ---------------- Track B ----------------

export function TrackBAdminActions({ application }: { application: TrackBApplication }) {
  const [panel, setPanel] = useState<'allocate' | 'review' | 'payout' | null>(null);
  const [allocationType, setAllocationType] = useState<TrackBAllocationType>('SKILL_BUILDING_TASK');
  const [allocationNote, setAllocationNote] = useState('');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [payoutNote, setPayoutNote] = useState('');

  const allocate = useAllocateTrackBWork();
  const review = useReviewTrackBSubmission();
  const payoutSent = useMarkPayoutSent();

  const togglePanel = (p: 'allocate' | 'review' | 'payout') => setPanel((cur) => (cur === p ? null : p));

  const showPayoutAction =
    application.status === 'APPROVED' &&
    application.allocationType === 'PAID_CLIENT_WORK' &&
    !application.payoutSentAt;

  return (
    <div className="flex flex-wrap gap-2">
      {application.status === 'PENDING' && (
        <InlinePanel label="Allocate work" open={panel === 'allocate'} onToggle={() => togglePanel('allocate')} variant="default">
          <div className="flex gap-2">
            {(['PAID_CLIENT_WORK', 'SKILL_BUILDING_TASK'] as const).map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={allocationType === t}
                onClick={() => setAllocationType(t)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-xs font-bold transition-colors',
                  allocationType === t ? 'border-primary bg-accent text-primary' : 'border-border text-muted-foreground',
                )}
              >
                {t === 'PAID_CLIENT_WORK' ? 'Paid client work' : 'Skill-building task'}
              </button>
            ))}
          </div>
          {allocationType === 'PAID_CLIENT_WORK' && (
            <Input
              type="number"
              min={0}
              placeholder="Payout amount (₹)"
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
            />
          )}
          <Textarea
            placeholder="Allocation note (what's the work?)"
            value={allocationNote}
            onChange={(e) => setAllocationNote(e.target.value)}
          />
          <Button
            size="sm"
            disabled={allocate.isPending}
            onClick={() =>
              allocate.mutate(
                {
                  id: application.id,
                  allocationType,
                  allocationNote: allocationNote.trim() || undefined,
                  payoutAmount:
                    allocationType === 'PAID_CLIENT_WORK' && payoutAmount ? Number(payoutAmount) : undefined,
                },
                {
                  onSuccess: () => {
                    toast.success('Work allocated');
                    setPanel(null);
                  },
                  onError: (e) => toast.error((e as Error).message),
                },
              )
            }
          >
            Allocate
          </Button>
        </InlinePanel>
      )}

      {application.status === 'SUBMITTED' && (
        <InlinePanel label="Review submission" open={panel === 'review'} onToggle={() => togglePanel('review')} variant="default">
          <Textarea
            placeholder="Review note (optional)"
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={review.isPending}
              onClick={() =>
                review.mutate(
                  { id: application.id, approve: true, reviewNote: reviewNote.trim() || undefined },
                  {
                    onSuccess: () => {
                      toast.success('Approved — certificate issued');
                      setPanel(null);
                    },
                    onError: (e) => toast.error((e as Error).message),
                  },
                )
              }
            >
              <Check className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={review.isPending}
              onClick={() =>
                review.mutate(
                  { id: application.id, approve: false, reviewNote: reviewNote.trim() || undefined },
                  {
                    onSuccess: () => {
                      toast.success('Sent back for changes');
                      setPanel(null);
                    },
                    onError: (e) => toast.error((e as Error).message),
                  },
                )
              }
            >
              <X className="h-3.5 w-3.5" /> Reject
            </Button>
          </div>
        </InlinePanel>
      )}

      {showPayoutAction && (
        <InlinePanel label="Mark payout sent" open={panel === 'payout'} onToggle={() => togglePanel('payout')}>
          <Textarea
            placeholder="Payout note (optional)"
            value={payoutNote}
            onChange={(e) => setPayoutNote(e.target.value)}
          />
          <Button
            size="sm"
            disabled={payoutSent.isPending}
            onClick={() =>
              payoutSent.mutate(
                { id: application.id, payoutNote: payoutNote.trim() || undefined },
                {
                  onSuccess: () => {
                    toast.success('Payout marked as sent');
                    setPanel(null);
                  },
                  onError: (e) => toast.error((e as Error).message),
                },
              )
            }
          >
            Mark sent
          </Button>
        </InlinePanel>
      )}

      {application.payoutSentAt && <Badge>Payout sent</Badge>}
    </div>
  );
}
