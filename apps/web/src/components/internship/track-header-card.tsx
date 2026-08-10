'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import {
  downloadVirtualRewardDocument,
  useMyVirtualInternshipTasks,
  type VirtualInternshipEnrollment,
} from '@/hooks/use-virtual-internship';
import { useMyCertificates } from '@/hooks/use-certificates';
import { downloadCertificate } from './certificate-card';
import styles from '@/app/virtual-internship/page.module.css';

const TRACK_LABEL: Record<'WEEK' | 'MONTH', string> = {
  WEEK: 'Web Development (4 week)',
  MONTH: 'Web Development + DevOps (4 month)',
};

const REWARD_ICON: Record<'certificate' | 'letter' | 'report' | 'community', string> = {
  certificate: '/rewards/certificate.png',
  letter: '/rewards/recommendation-letter.png',
  report: '/rewards/report-card.png',
  community: '/rewards/community.png',
};

function RewardIcon({ icon, locked }: { icon: keyof typeof REWARD_ICON; locked: boolean }) {
  return (
    <span className={styles.tkIc} style={{ backgroundImage: `url(${REWARD_ICON[icon]})` }}>
      {locked && (
        <span className={styles.tkLock}>
          <Lock className="h-2.5 w-2.5" />
        </span>
      )}
    </span>
  );
}

/**
 * The welcome + progress + rewards header shared by the "My Courses" summary
 * cards and the top of the full per-track task dashboard.
 */
export function TrackHeaderCard({
  enrollment,
  onFinishClick,
}: {
  enrollment: VirtualInternshipEnrollment;
  onFinishClick: () => void;
}) {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const { data } = useMyVirtualInternshipTasks(enrollment.id);
  const { data: certificates } = useMyCertificates();
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
  const tasksLeft = tasks.filter((t) => t.status !== 'APPROVED').length;
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

  return (
    <div className={styles.tkCard}>
      <span className={styles.tkPill}>{TRACK_LABEL[enrollment.track]}</span>

      <div className={styles.tkRow}>
        <div className={styles.tkLeft}>
          <div className={styles.tkAvatar}>{initials}</div>
          <div className={styles.tkHi}>
            <h2>Welcome, {firstName}!</h2>
            <div className={styles.tkProg}>
              <div className={styles.tkBar}>
                <span className={styles.tkBarFill} style={{ width: `${Math.round(progress * 100)}%` }} />
              </div>
              <span className={styles.tkPct}>
                Your track is <b>{Math.round(progress * 100)}%</b> complete
              </span>
            </div>
            <button type="button" className={styles.tkNext} onClick={onFinishClick}>
              {tasksLeft > 0
                ? `Finish your track — ${tasksLeft} task${tasksLeft > 1 ? 's' : ''} left`
                : 'All tasks complete — claim your rewards'}
              <ArrowRight className="h-[15px] w-[15px]" strokeWidth={2.6} />
            </button>
          </div>
        </div>

        <div className={styles.tkDiv} />

        <div>
          <span className={styles.tkLabel}>Your rewards</span>
          <nav className={styles.tkRewards} aria-label="Your rewards">
            <a href="https://chat.whatsapp.com/" target="_blank" rel="noreferrer" className={styles.tkRw}>
              <RewardIcon icon="community" locked={false} />
              <b>Join community</b>
            </a>

            <button
              type="button"
              className={cn(styles.tkRw, (!unlocked || !certificate) && styles.tkRwLocked)}
              disabled={!unlocked || !certificate || downloading === 'certificate'}
              onClick={() =>
                certificate &&
                withDownloading('certificate', () => downloadCertificate(certificate.id, certificate.code, token))
              }
            >
              <RewardIcon icon="certificate" locked={!unlocked || !certificate} />
              <b>Virtual internship certificate</b>
            </button>

            <button
              type="button"
              className={cn(styles.tkRw, !unlocked && styles.tkRwLocked)}
              disabled={!unlocked || downloading === 'letter'}
              onClick={() => withDownloading('letter', () => downloadVirtualRewardDocument('letter', enrollment.id, token))}
            >
              <RewardIcon icon="letter" locked={!unlocked} />
              <b>Recommendation letter</b>
            </button>

            <button
              type="button"
              className={cn(styles.tkRw, !unlocked && styles.tkRwLocked)}
              disabled={!unlocked || downloading === 'report'}
              onClick={() => withDownloading('report', () => downloadVirtualRewardDocument('report', enrollment.id, token))}
            >
              <RewardIcon icon="report" locked={!unlocked} />
              <b>Report card</b>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}
