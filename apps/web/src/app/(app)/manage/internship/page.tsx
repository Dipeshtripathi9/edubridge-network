'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, GraduationCap, Rocket } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FilterChips } from '@/components/ui/filter-chips';
import { EmptyState } from '@/components/ui/empty-state';
import { TrackAAdminActions, TrackBAdminActions } from '@/components/internship/admin-review-actions';
import { useAuthStore } from '@/stores/auth.store';
import {
  useAdminTrackAEnrollments,
  type EnrollmentStatus,
  type TrackAEnrollment,
} from '@/hooks/use-internships';
import {
  useAdminTrackBApplications,
  type TrackBApplication,
  type TrackBApplicationStatus,
} from '@/hooks/use-internship-applications';

const TRACK_A_STATUSES: { value: EnrollmentStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING_PAYMENT', label: 'Pending payment' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const TRACK_B_STATUSES: { value: TrackBApplicationStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ALLOCATED', label: 'Allocated' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

const TASK_STATUS_TONE: Record<string, string> = {
  ASSIGNED: 'bg-secondary text-secondary-foreground',
  SUBMITTED: 'bg-marigold-soft text-amber-600',
  APPROVED: 'bg-green-soft text-green',
  REJECTED: 'bg-destructive/10 text-destructive',
};

function UserLine({ user }: { user: TrackAEnrollment['user'] | TrackBApplication['user'] }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="font-semibold">{user?.profile?.fullName ?? 'Unknown student'}</span>
      {user?.email && <span className="text-xs text-muted-foreground">{user.email}</span>}
    </div>
  );
}

function TrackAPanel() {
  const [status, setStatus] = useState<EnrollmentStatus | 'ALL'>('ALL');
  const { data, isLoading } = useAdminTrackAEnrollments(status === 'ALL' ? undefined : status);

  return (
    <div className="space-y-4">
      <FilterChips options={TRACK_A_STATUSES} value={status} onChange={setStatus} />
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !data?.data.length ? (
        <EmptyState icon={GraduationCap} title="No enrollments" description="No Track A enrollments match this filter." />
      ) : (
        <div className="space-y-3">
          {data.data.map((enrollment) => (
            <Card key={enrollment.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <UserLine user={enrollment.user} />
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {enrollment.subtype === 'OWN_PROJECT' ? 'Own Project' : 'Guided Learning'} · ₹
                      {enrollment.feeAmount.toLocaleString()}
                    </p>
                  </div>
                  <Badge variant="secondary">{enrollment.status.replaceAll('_', ' ')}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{enrollment.projectDescription}</p>
                {enrollment.paymentReferenceNote && (
                  <p className="text-xs text-muted-foreground">
                    Payment ref: <span className="font-mono">{enrollment.paymentReferenceNote}</span>
                  </p>
                )}
                {enrollment.mentorNote && (
                  <p className="text-xs text-muted-foreground">Mentor note: {enrollment.mentorNote}</p>
                )}
                {(enrollment.tasks?.length ?? 0) > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {enrollment.tasks?.map((t) => (
                      <span
                        key={t.id}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${TASK_STATUS_TONE[t.status]}`}
                      >
                        {t.title}
                      </span>
                    ))}
                  </div>
                )}
                <TrackAAdminActions enrollment={enrollment} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TrackBPanel() {
  const [status, setStatus] = useState<TrackBApplicationStatus | 'ALL'>('ALL');
  const { data, isLoading } = useAdminTrackBApplications(status === 'ALL' ? undefined : status);

  return (
    <div className="space-y-4">
      <FilterChips options={TRACK_B_STATUSES} value={status} onChange={setStatus} />
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !data?.data.length ? (
        <EmptyState icon={Rocket} title="No applications" description="No Track B applications match this filter." />
      ) : (
        <div className="space-y-3">
          {data.data.map((application) => (
            <Card key={application.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <UserLine user={application.user} />
                  <Badge variant="secondary">{application.status}</Badge>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {application.skills.map((s) => (
                    <span key={s} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                      {s}
                    </span>
                  ))}
                </div>
                {application.bio && <p className="text-sm text-muted-foreground">{application.bio}</p>}
                {application.portfolioUrl && (
                  <a href={application.portfolioUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                    Portfolio
                  </a>
                )}
                {application.allocationType && (
                  <p className="text-xs text-muted-foreground">
                    Allocated: {application.allocationType === 'PAID_CLIENT_WORK' ? 'Paid client work' : 'Skill-building task'}
                    {application.payoutAmount != null && ` · ₹${application.payoutAmount.toLocaleString()}`}
                  </p>
                )}
                {application.allocationNote && (
                  <p className="text-sm text-muted-foreground">{application.allocationNote}</p>
                )}
                {application.submissionUrl && (
                  <a href={application.submissionUrl} target="_blank" rel="noreferrer" className="text-sm text-primary underline">
                    View submission
                  </a>
                )}
                {application.reviewNote && (
                  <p className="text-sm text-muted-foreground">Review note: {application.reviewNote}</p>
                )}
                <TrackBAdminActions application={application} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ManageInternshipPage() {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  useEffect(() => {
    if (hydrated && !isAdmin) router.replace('/home');
  }, [hydrated, isAdmin, router]);

  if (!hydrated || !isAdmin) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <GraduationCap className="h-6 w-6 text-primary" /> Internship · Manage
          </h1>
          <p className="text-muted-foreground">Track A enrollments &amp; Track B applications.</p>
        </div>
        <Link href="/internship" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          View landing page <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>

      <Tabs defaultValue="track-a">
        <TabsList>
          <TabsTrigger value="track-a">
            <GraduationCap className="mr-1 h-4 w-4" /> Track A
          </TabsTrigger>
          <TabsTrigger value="track-b">
            <Rocket className="mr-1 h-4 w-4" /> Track B
          </TabsTrigger>
        </TabsList>

        <TabsContent value="track-a" className="mt-4">
          <TrackAPanel />
        </TabsContent>

        <TabsContent value="track-b" className="mt-4">
          <TrackBPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
