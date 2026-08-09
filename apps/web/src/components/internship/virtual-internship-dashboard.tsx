'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { toast } from 'sonner';
import { Award, CheckCircle2, ChevronDown, ClipboardCheck, Download, FileText, Lock, MessageCircle } from 'lucide-react';
import { cn, isSafeHttpUrl } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import {
  downloadVirtualInvoice,
  downloadVirtualRewardDocument,
  useMyVirtualInternshipTasks,
  useSubmitVirtualInternshipTask,
  type VirtualInternshipEnrollment,
  type VirtualInternshipTaskView,
} from '@/hooks/use-virtual-internship';
import { useMyCertificates } from '@/hooks/use-certificates';
import { downloadCertificate } from './certificate-card';
import styles from '@/app/virtual-internship/page.module.css';

const TRACK_LABEL: Record<'WEEK' | 'MONTH', string> = {
  WEEK: 'Web development (4 week)',
  MONTH: 'Web development + DevOps (4 month)',
};

function TaskItem({
  task,
  isOpen,
  onToggle,
}: {
  task: VirtualInternshipTaskView;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [url, setUrl] = useState(task.submissionUrl ?? '');
  const [note, setNote] = useState('');
  const submit = useSubmitVirtualInternshipTask();

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
    <div className={cn(styles.taskItem, isOpen && styles.taskItemOpen)}>
      <button type="button" className={styles.taskQ} onClick={onToggle}>
        <span
          className={cn(styles.taskNum, done && styles.taskNumDone, !done && task.unlocked && styles.taskNumCurrent)}
        >
          {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : task.taskIndex}
        </span>
        <span className={styles.taskTitle}>{task.title}</span>
        {underReview && <span className={cn(styles.taskTag, styles.taskTagReview)}>Under review</span>}
        {!done && !underReview && task.unlocked && (
          <span className={cn(styles.taskTag, styles.taskTagCurrent)}>Up next</span>
        )}
        {done && <span className={cn(styles.taskTag, styles.taskTagDone)}>Done</span>}
        <ChevronDown className={cn(styles.taskChev, isOpen && styles.taskChevOpen)} width={18} height={18} />
      </button>
      <div className={cn(styles.taskBody, isOpen && styles.taskBodyOpen)}>
        <div className={styles.taskBodyInner}>
          <h5>Task objective</h5>
          <p>{task.objective}</p>
          <h5>Expected deliverables</h5>
          <p>{task.deliverables}</p>
          <h5>Key steps to complete the task</h5>
          <ol>
            {task.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <h5>Evaluation criteria</h5>
          <p>{task.evaluationCriteria}</p>
          <p className={styles.taskLockedNote}>{task.estimatedHours}</p>

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

function RewardButton({
  icon,
  title,
  sub,
  locked,
  disabled,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  sub: string;
  locked: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={styles.rewardItem} disabled={locked || disabled} onClick={onClick}>
      <span className={cn(styles.rewardIcon, locked && styles.rewardIconLocked)}>
        {locked ? <Lock className="h-4 w-4" /> : icon}
      </span>
      <span>
        <span className={styles.rewardTitle}>{title}</span>
        <span className={styles.rewardSub}>
          {locked ? (
            <>
              <Lock className="h-3 w-3" /> Unlocks at 100%
            </>
          ) : (
            sub
          )}
        </span>
      </span>
    </button>
  );
}

export function EnrolledDashboard({ enrollment }: { enrollment: VirtualInternshipEnrollment }) {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const { data, isLoading } = useMyVirtualInternshipTasks();
  const { data: certificates } = useMyCertificates();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const fullName = user?.profile?.fullName ?? 'there';
  const firstName = fullName.split(' ')[0];
  const initials =
    fullName
      .split(' ')
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'ED';

  const progress = data?.progress ?? 0;
  const tasks = data?.tasks ?? [];
  const unlocked = progress >= 1;
  const currentTaskIndex =
    tasks.find((t) => t.unlocked && t.status !== 'APPROVED')?.taskIndex ?? tasks[0]?.taskIndex ?? 1;

  const certificate = certificates?.find((c) => c.sourceType === 'VIRTUAL_INTERNSHIP' && c.sourceId === enrollment.id);

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
    return (
      <div className={styles.dashWrap}>
        <div className={styles.dashCard}>Loading your track…</div>
      </div>
    );
  }

  return (
    <div className={styles.dashWrap}>
      <div className={styles.dashCard}>
        <div className={styles.dashWelcome}>
          <div className={styles.dashAvatar}>{initials}</div>
          <div>
            <h2>Welcome, {firstName}!</h2>
            <div className={styles.dashTrackLabel}>{TRACK_LABEL[enrollment.track]}</div>
            <div className={styles.dashProgressRow}>
              <div className={styles.dashProgressBar}>
                <div className={styles.dashProgressFill} style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <span className={styles.dashProgressTxt}>
                Your track is <b>{Math.round(progress * 100)}%</b> complete
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.dashCard}>
        <h3 className={styles.dashSectionTitle}>
          <ClipboardCheck className="mr-2 inline h-5 w-5" style={{ color: 'var(--forest-deep)' }} /> Tasks and duties
        </h3>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            isOpen={openIndex === task.taskIndex || (openIndex === null && task.taskIndex === currentTaskIndex)}
            onToggle={() => setOpenIndex(openIndex === task.taskIndex ? null : task.taskIndex)}
          />
        ))}
      </div>

      <div className={styles.dashCard}>
        <h3 className={styles.dashSectionTitle}>Your rewards</h3>
        <div className={styles.rewardsList}>
          <a href="https://chat.whatsapp.com/" target="_blank" rel="noreferrer" className={styles.rewardItem}>
            <span className={styles.rewardIcon}>
              <MessageCircle className="h-5 w-5" />
            </span>
            <span>
              <span className={styles.rewardTitle}>Join community</span>
              <span className={styles.rewardSub}>Connect with mentors and peers</span>
            </span>
          </a>

          <RewardButton
            icon={<Award className="h-5 w-5" />}
            title="Virtual internship certificate"
            sub="Download your certificate"
            locked={!unlocked || !certificate}
            disabled={downloading === 'certificate'}
            onClick={() =>
              certificate &&
              withDownloading('certificate', () => downloadCertificate(certificate.id, certificate.code, token))
            }
          />

          <RewardButton
            icon={<FileText className="h-5 w-5" />}
            title="Recommendation letter"
            sub="Download your letter"
            locked={!unlocked}
            disabled={downloading === 'letter'}
            onClick={() => withDownloading('letter', () => downloadVirtualRewardDocument('letter', enrollment.id, token))}
          />

          <RewardButton
            icon={<FileText className="h-5 w-5" />}
            title="Report card"
            sub="Download your report card"
            locked={!unlocked}
            disabled={downloading === 'report'}
            onClick={() => withDownloading('report', () => downloadVirtualRewardDocument('report', enrollment.id, token))}
          />
        </div>
      </div>

      <div className={styles.dashFooter}>
        <button
          type="button"
          className={styles.btnInvoice}
          disabled={downloading === 'invoice'}
          onClick={() => withDownloading('invoice', () => downloadVirtualInvoice(enrollment.id, token))}
        >
          <Download className="h-3.5 w-3.5" /> Invoice
        </button>
      </div>
    </div>
  );
}
