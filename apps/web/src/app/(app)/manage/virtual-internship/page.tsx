'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Award, Clock, FileCheck2, GraduationCap, Rocket, ShieldCheck, Star, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FilterChips } from '@/components/ui/filter-chips';
import { EmptyState } from '@/components/ui/empty-state';
import { VirtualInternshipAdminActions } from '@/components/internship/virtual-internship-admin-actions';
import { useAuthStore } from '@/stores/auth.store';
import {
  useAdminVirtualInternshipEnrollments,
  useVirtualInternshipMetrics,
  type VirtualInternshipEnrollment,
  type VirtualInternshipStatus,
  type VirtualInternshipTrack,
} from '@/hooks/use-virtual-internship';

const STATUSES: { value: VirtualInternshipStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING_PAYMENT', label: 'Pending payment' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

// Submission deadline = track length from the day payment was confirmed (the
// day the track actually started). No task-submission system exists yet, so
// this is the one real, non-fabricated signal we have for "is this student on
// schedule" — matches the durations already advertised on the landing page.
const TRACK_DAYS: Record<VirtualInternshipTrack, number> = { FOUR_WEEK: 28, FOUR_MONTH: 121 };
const DAY_MS = 24 * 60 * 60 * 1000;

function getExpectedDeadline(enrollment: VirtualInternshipEnrollment): Date | null {
  if (!enrollment.paidAt) return null;
  return new Date(new Date(enrollment.paidAt).getTime() + TRACK_DAYS[enrollment.track] * DAY_MS);
}

function DeadlineBadge({ enrollment }: { enrollment: VirtualInternshipEnrollment }) {
  if (enrollment.status !== 'ACTIVE') return null;
  const deadline = getExpectedDeadline(enrollment);
  if (!deadline) return null;

  const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / DAY_MS);
  const overdue = daysLeft < 0;

  return (
    <Badge variant="outline" className={overdue ? 'border-destructive text-destructive' : 'border-border text-muted-foreground'}>
      <Clock className="mr-1 h-3 w-3" />
      {overdue ? `Overdue by ${Math.abs(daysLeft)}d` : `Due ${deadline.toLocaleDateString()}`}
    </Badge>
  );
}

function UserLine({ user }: { user: VirtualInternshipEnrollment['user'] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-semibold">{user?.profile?.fullName ?? 'Unknown student'}</span>
      {user?.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Wallet; label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <span className="grid h-9 w-9 flex-none place-items-center rounded-xl bg-accent text-primary">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <div>
          <p className="font-display text-xl font-extrabold leading-none">{value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricsRow() {
  const { data, isLoading } = useVirtualInternshipMetrics();

  if (isLoading) return <Skeleton className="h-24 w-full" />;
  if (!data) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <Stat icon={Rocket} label="Registrations" value={data.totalEnrollments} />
      <Stat icon={Wallet} label="Active" value={data.byStatus.ACTIVE ?? 0} />
      <Stat icon={ShieldCheck} label="Completed" value={data.byStatus.COMPLETED ?? 0} />
      <Stat icon={FileCheck2} label="Payment confirmed rate" value={`${data.paymentConfirmedRate}%`} />
      <Stat icon={FileCheck2} label="Completion rate" value={`${data.completionRate}%`} />
      <Stat icon={Award} label="Certificates issued" value={data.certificatesIssued} />
      <Stat icon={GraduationCap} label="Average quiz score" value={`${data.averageQuizScorePercent}%`} />
      <Stat
        icon={Star}
        label={`Satisfaction (${data.feedbackCount})`}
        value={data.averageSatisfactionRating === null ? '—' : `${data.averageSatisfactionRating}/5`}
      />
    </div>
  );
}

export default function ManageVirtualInternshipPage() {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  const [status, setStatus] = useState<VirtualInternshipStatus | 'ALL'>('ALL');
  const { data, isLoading } = useAdminVirtualInternshipEnrollments(status === 'ALL' ? undefined : status);

  useEffect(() => {
    if (hydrated && !isAdmin) router.replace('/home');
  }, [hydrated, isAdmin, router]);

  if (!hydrated || !isAdmin) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Rocket className="h-6 w-6 text-primary" /> Virtual Internship · Manage
          </h1>
          <p className="text-muted-foreground">Enrollments, payment confirmation, evaluation & certificates.</p>
        </div>
        <Link href="/virtual-internship" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          View landing page <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <MetricsRow />

      <div className="space-y-4">
        <FilterChips options={STATUSES} value={status} onChange={setStatus} />
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !data?.data.length ? (
          <EmptyState icon={Rocket} title="No enrollments" description="No Virtual Internship enrollments match this filter." />
        ) : (
          <div className="space-y-3">
            {data.data.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardContent className="space-y-3 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <UserLine user={enrollment.user} />
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {enrollment.track === 'FOUR_MONTH' ? '4-Month Track' : '4-Week Track'} · ₹
                        {enrollment.feeAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary">{enrollment.status.replaceAll('_', ' ')}</Badge>
                      <DeadlineBadge enrollment={enrollment} />
                      {enrollment.evaluationStatus !== 'PENDING' && (
                        <Badge
                          variant="outline"
                          className={
                            enrollment.evaluationStatus === 'PASSED'
                              ? 'border-green text-green'
                              : 'border-destructive text-destructive'
                          }
                        >
                          {enrollment.evaluationStatus === 'PASSED' ? 'Passed' : 'Failed'} review
                        </Badge>
                      )}
                    </div>
                  </div>
                  {enrollment.paymentReferenceNote && (
                    <p className="text-xs text-muted-foreground">
                      Payment ref: <span className="font-mono">{enrollment.paymentReferenceNote}</span>
                    </p>
                  )}
                  {enrollment.evaluationNote && (
                    <p className="text-xs text-muted-foreground">Review note: {enrollment.evaluationNote}</p>
                  )}
                  <VirtualInternshipAdminActions enrollment={enrollment} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
