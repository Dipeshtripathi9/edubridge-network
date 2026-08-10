'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, ChevronDown, ClipboardCheck } from 'lucide-react';
import { cn, isSafeHttpUrl } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import {
  downloadVirtualInvoice,
  useMyVirtualInternshipTasks,
  useSubmitVirtualInternshipTask,
  type VirtualInternshipEnrollment,
  type VirtualInternshipTaskView,
} from '@/hooks/use-virtual-internship';
import { TrackHeaderCard } from './track-header-card';
import styles from '@/app/virtual-internship/page.module.css';

const RING_RADIUS = 28;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Binary 0%/100% circular progress ring, replacing the old numbered circle. */
function ProgressRing({ done, current, weekLabel }: { done: boolean; current: boolean; weekLabel: string }) {
  const percent = done ? 100 : 0;
  const offset = RING_CIRCUMFERENCE - (percent / 100) * RING_CIRCUMFERENCE;
  return (
    <div className={styles.ringWrap}>
      <div className={styles.ringSvgBox}>
        <svg width={64} height={64} viewBox="0 0 64 64">
          <circle className={styles.ringTrack} cx={32} cy={32} r={RING_RADIUS} strokeWidth={4} />
          <circle
            className={cn(styles.ringBar, current && !done && styles.ringBarCurrent)}
            cx={32}
            cy={32}
            r={RING_RADIUS}
            strokeWidth={4}
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={offset}
          />
        </svg>
        <span className={styles.ringPercent}>{done ? <CheckCircle2 className="h-4 w-4" /> : `${percent}%`}</span>
      </div>
      <span className={styles.ringWeekLabel}>{weekLabel}</span>
    </div>
  );
}

function TaskItem({
  enrollmentId,
  task,
  isOpen,
  onToggle,
}: {
  enrollmentId: string;
  task: VirtualInternshipTaskView;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [url, setUrl] = useState(task.submissionUrl ?? '');
  const [note, setNote] = useState('');
  const submit = useSubmitVirtualInternshipTask(enrollmentId);

  const done = task.status === 'APPROVED';
  const underReview = task.status === 'SUBMITTED';
  const canSubmit = task.unlocked && !done && !underReview;

  const onSubmit = () => {
    if (!isSafeHttpUrl(url)) {
      toast.error('Enter a valid link (https://...)');
      return;
    }
    submit.mutate(
      { taskIndex: task.taskIndex, submissionUrl: url, note: note || undefined },
      {
        onSuccess: () => toast.success('Submitted for mentor review'),
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <div id={`task-${task.taskIndex}`} className={cn(styles.taskItem, isOpen && styles.taskItemOpen)}>
      <button type="button" className={styles.taskQ} onClick={onToggle}>
        <ProgressRing done={done} current={!done && task.unlocked} weekLabel={`Week ${task.taskIndex}`} />
        <span className={styles.taskTitleWrap}>
          <span className={styles.taskTitle}>{task.title}</span>
          <span className={styles.taskTagRow}>
            {underReview && <span className={cn(styles.taskTag, styles.taskTagReview)}>Under review</span>}
            {!done && !underReview && task.unlocked && (
              <span className={cn(styles.taskTag, styles.taskTagCurrent)}>Up next</span>
            )}
            {done && <span className={cn(styles.taskTag, styles.taskTagDone)}>Done</span>}
          </span>
        </span>
        <ChevronDown className={cn(styles.taskChev, isOpen && styles.taskChevOpen)} width={18} height={18} />
      </button>
      <div className={cn(styles.taskBody, isOpen && styles.taskBodyOpen)}>
        <div className={styles.taskBodyInner}>
          {task.description ? (
            // Admin-assigned custom task — no static breakdown, just the note the admin wrote.
            <p>{task.description}</p>
          ) : (
            <>
              <h5>Task objective</h5>
              <p>{task.objective}</p>
              <h5>Expected deliverables</h5>
              <p>{task.deliverables}</p>
              <h5>Key steps to complete the task</h5>
              <ol>
                {task.steps?.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <h5>Evaluation criteria</h5>
              <p>{task.evaluationCriteria}</p>
              <p className={styles.taskLockedNote}>{task.estimatedHours}</p>
            </>
          )}

          {task.reviewNote && (done || task.status === 'REJECTED') && (
            <p className={styles.taskReviewNote}>Mentor note: {task.reviewNote}</p>
          )}

          {canSubmit && (
            <div className={styles.taskSubmitRow}>
              <input
                placeholder="Link to your work (repo, deployed URL...)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <input
                placeholder="Note for your mentor (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button
                type="button"
                className={styles.taskSubmitBtn}
                disabled={submit.isPending || !url.trim()}
                onClick={onSubmit}
              >
                {task.status === 'REJECTED' ? 'Resubmit' : 'Submit'}
              </button>
            </div>
          )}
          {underReview && <p className={styles.taskLockedNote}>Submitted — waiting on mentor review.</p>}
          {!task.unlocked && <p className={styles.taskLockedNote}>Complete the previous task to unlock this one.</p>}
        </div>
      </div>
    </div>
  );
}

interface TaskGroup {
  monthNumber?: number;
  monthTitle?: string;
  monthDescription?: string;
  status: 'now' | 'soon' | 'done';
  tasks: VirtualInternshipTaskView[];
}

/**
 * Groups consecutive tasks sharing a `monthNumber` (the MONTH track's 16
 * weekly tasks, 4 per month) into headed sections; tasks without a
 * `monthNumber` (the WEEK track's flat 4, or any admin-assigned custom task
 * appended after the curriculum) render with no header, same as before.
 */
function groupTasksByMonth(tasks: VirtualInternshipTaskView[]): TaskGroup[] {
  const groups: TaskGroup[] = [];
  for (const task of tasks) {
    const last = groups[groups.length - 1];
    if (last && last.monthNumber === task.monthNumber) {
      last.tasks.push(task);
    } else {
      groups.push({
        monthNumber: task.monthNumber,
        monthTitle: task.monthTitle,
        monthDescription: task.monthDescription,
        status: 'soon',
        tasks: [task],
      });
    }
  }
  for (const group of groups) {
    const allDone = group.tasks.every((t) => t.status === 'APPROVED');
    const anyCurrent = group.tasks.some((t) => t.unlocked && t.status !== 'APPROVED');
    group.status = allDone ? 'done' : anyCurrent ? 'now' : 'soon';
  }
  return groups;
}

export function EnrolledDashboard({ enrollment }: { enrollment: VirtualInternshipEnrollment }) {
  const token = useAuthStore((s) => s.accessToken);
  const { data, isLoading } = useMyVirtualInternshipTasks(enrollment.id);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const tasks = data?.tasks ?? [];
  const currentTaskIndex =
    tasks.find((t) => t.unlocked && t.status !== 'APPROVED')?.taskIndex ?? tasks[0]?.taskIndex ?? 1;

  const goToCurrentTask = () => {
    setOpenIndex(currentTaskIndex);
    document.getElementById(`task-${currentTaskIndex}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const withDownloading = async (key: string, fn: () => Promise<void>) => {
    setDownloading(key);
    try {
      await fn();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDownloading(null);
    }
  };

  if (isLoading) {
    return <div className={styles.dashWrap}>Loading your track…</div>;
  }

  return (
    <div className={styles.dashWrap}>
      <TrackHeaderCard enrollment={enrollment} onFinishClick={goToCurrentTask} />

      <section className={styles.dashSched}>
        <h3 className={styles.dashSectionTitle}>
          <ClipboardCheck className="mr-2 inline h-5 w-5" style={{ color: 'var(--forest-deep)' }} /> Tasks and duties
        </h3>
        {data?.trackNote && <p className={styles.dashTrackNote}>{data.trackNote}</p>}
        {groupTasksByMonth(tasks).map((group, i) => (
          <div key={group.monthNumber ?? `ungrouped-${i}`} className={group.monthNumber ? styles.dashMonthGroup : undefined}>
            {group.monthNumber && (
              <div className={styles.dashMonthHead}>
                <span className={styles.dashMonthChip}>Month {group.monthNumber}</span>
                <div>
                  <h4>{group.monthTitle}</h4>
                  <p>{group.monthDescription}</p>
                </div>
                <span className={cn(styles.dashMonthTag, group.status === 'done' && styles.dashMonthTagDone, group.status === 'now' && styles.dashMonthTagNow)}>
                  {group.status === 'done' ? 'Done' : group.status === 'now' ? 'In progress' : 'Locked'}
                </span>
              </div>
            )}
            {group.tasks.map((task) => (
              <TaskItem
                key={task.id}
                enrollmentId={enrollment.id}
                task={task}
                isOpen={openIndex === task.taskIndex || (openIndex === null && task.taskIndex === currentTaskIndex)}
                onToggle={() => setOpenIndex(openIndex === task.taskIndex ? null : task.taskIndex)}
              />
            ))}
          </div>
        ))}
      </section>

      <div className={styles.dashFooter}>
        <button
          type="button"
          className={styles.btnInvoice}
          disabled={downloading === 'invoice'}
          onClick={() => withDownloading('invoice', () => downloadVirtualInvoice(enrollment.id, token))}
        >
          View invoice
        </button>
      </div>
    </div>
  );
}
