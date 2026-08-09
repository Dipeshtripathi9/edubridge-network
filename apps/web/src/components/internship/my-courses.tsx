'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Check, ChevronRight, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import {
  downloadVirtualInvoice,
  useMyVirtualInternshipTasks,
  type VirtualInternshipEnrollment,
} from '@/hooks/use-virtual-internship';
import { TRACKS, money, moneyPrecise, formatInternshipDate, trackKeyFor } from '@/lib/virtual-internship-tracks';
import styles from '@/app/virtual-internship/page.module.css';

function CourseCard({
  enrollment,
  onContinue,
}: {
  enrollment: VirtualInternshipEnrollment;
  onContinue: (enrollment: VirtualInternshipEnrollment) => void;
}) {
  const token = useAuthStore((s) => s.accessToken);
  const { data } = useMyVirtualInternshipTasks(enrollment.id);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const track = TRACKS[trackKeyFor(enrollment.track)];

  const progress = data?.progress ?? 0;
  const tasks = data?.tasks ?? [];
  const nextTask = tasks.find((t) => t.unlocked && t.status !== 'APPROVED');
  const stepLabel =
    progress >= 1
      ? 'All tasks approved — certificate unlocked'
      : nextTask
        ? `Task ${nextTask.taskIndex} of ${tasks.length} — ${nextTask.title}`
        : 'Not started — your first task opens right away';

  const onInvoice = async () => {
    setDownloadingInvoice(true);
    try {
      await downloadVirtualInvoice(enrollment.id, token);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setDownloadingInvoice(false);
    }
  };

  return (
    <article className={styles.courseCard}>
      <div className={styles.badgeRow}>
        <span className={cn(styles.badge, styles.badgeLive)}>{track.online}</span>
        <span className={cn(styles.badge, styles.badgeGhost)}>{track.badge}</span>
      </div>

      <h2>{track.name}</h2>
      <p className={styles.courseDesc}>{track.tagline}</p>

      <ul className={styles.courseIncludes}>
        {track.features.slice(0, 5).map((f) => (
          <li key={f}>
            <Check className="h-[15px] w-[15px]" strokeWidth={2.6} />
            {f}
          </li>
        ))}
      </ul>

      <div className={styles.progBlock}>
        <div className={styles.progTop}>
          <span>Your progress</span>
          <b>{Math.round(progress * 100)}%</b>
        </div>
        <div className={styles.progBar}>
          <div className={styles.progFill} style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
        <p className={styles.progStep}>{stepLabel}</p>
        <p className={styles.courseMeta}>
          Order {enrollment.razorpayOrderId ?? enrollment.id.slice(0, 10)}
          {enrollment.paidAt ? ` · purchased ${formatInternshipDate(new Date(enrollment.paidAt))}` : ''} ·{' '}
          {moneyPrecise(enrollment.feeAmount)} paid
        </p>
      </div>

      <div className={styles.btnRow}>
        <button type="button" className={cn(styles.btn, styles.btnPrimary)} onClick={() => onContinue(enrollment)}>
          {progress > 0 ? 'Continue' : 'Start track'}
          <ChevronRight className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={cn(styles.btn, styles.btnGhost)}
          disabled={downloadingInvoice}
          onClick={onInvoice}
        >
          <Download className="h-3.5 w-3.5" /> Invoice
        </button>
      </div>
    </article>
  );
}

export function MyCourses({
  enrollments,
  onContinue,
}: {
  enrollments: VirtualInternshipEnrollment[];
  onContinue: (enrollment: VirtualInternshipEnrollment) => void;
}) {
  return (
    <section className={styles.myCourses}>
      <div className={styles.myCoursesHead}>
        <h1>My courses</h1>
        <p>{enrollments.length > 1 ? 'Two tracks purchased.' : 'One track purchased.'} Pick up where you left off.</p>
      </div>
      <div className={styles.courseGrid}>
        {enrollments.map((e) => (
          <CourseCard key={e.id} enrollment={e} onContinue={onContinue} />
        ))}
      </div>
    </section>
  );
}
