'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Laptop } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth.store';
import {
  useVirtualInternshipEnrollments,
  useVirtualInternshipScholarships,
  type VirtualInternshipEnrollmentAdmin,
} from '@/hooks/use-virtual-internship-admin';
import { cn } from '@/lib/utils';

const TRACK_LABEL: Record<string, string> = { WEEK: '1-Week', MONTH: '1-Month' };

function EnrollmentRow({ e }: { e: VirtualInternshipEnrollmentAdmin }) {
  const approved = e.tasks.filter((t) => t.status === 'APPROVED').length;
  return (
    <div className="flex flex-wrap items-center gap-4 p-3 text-sm">
      <div className="min-w-[220px] flex-1">
        <p className="font-semibold">{e.user.profile?.fullName ?? '—'}</p>
        <p className="text-muted-foreground">{e.user.email ?? e.user.phone ?? '—'}</p>
      </div>
      <span className="min-w-[90px]">{TRACK_LABEL[e.track] ?? e.track}</span>
      <span className="min-w-[130px]">{e.status}</span>
      <span className="min-w-[110px]">₹{e.feeAmount}</span>
      <span className="min-w-[90px] text-muted-foreground">
        {approved}/{e.tasks.length} tasks
      </span>
      <span className="min-w-[140px] text-muted-foreground">
        {e.referralApplied && 'Referral '}
        {e.donateApplied && 'Donate '}
        {e.scholarshipApplied && 'Scholarship'}
      </span>
    </div>
  );
}

function EnrollmentsList() {
  const { data, isLoading } = useVirtualInternshipEnrollments();
  const enrollments = data ?? [];

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (enrollments.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">No enrollments yet.</CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          <div className="flex flex-wrap gap-4 bg-muted/40 p-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="min-w-[220px] flex-1">Student</span>
            <span className="min-w-[90px]">Track</span>
            <span className="min-w-[130px]">Status</span>
            <span className="min-w-[110px]">Fee</span>
            <span className="min-w-[90px]">Tasks</span>
            <span className="min-w-[140px]">Entitlements</span>
          </div>
          {enrollments.map((e) => (
            <EnrollmentRow key={e.id} e={e} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ScholarshipsList() {
  const { data, isLoading } = useVirtualInternshipScholarships();
  const rows = data ?? [];

  if (isLoading) return <Skeleton className="h-24 w-full" />;
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">No scholarship caps configured yet.</CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          <div className="flex flex-wrap gap-4 bg-muted/40 p-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="min-w-[120px]">Track</span>
            <span className="min-w-[120px]">Capacity</span>
          </div>
          {rows.map((r) => (
            <div key={r.id} className="flex flex-wrap gap-4 p-3 text-sm">
              <span className="min-w-[120px]">{TRACK_LABEL[r.track] ?? r.track}</span>
              <span className="min-w-[120px]">{r.capacity}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

type Segment = 'enrollments' | 'scholarships';
const SEGMENTS: { key: Segment; label: string }[] = [
  { key: 'enrollments', label: 'Enrollments' },
  { key: 'scholarships', label: 'Scholarship caps' },
];

export default function VirtualInternshipManagerPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const [segment, setSegment] = useState<Segment>('enrollments');

  useEffect(() => {
    if (hydrated && !isAdmin) router.replace('/home');
  }, [hydrated, isAdmin, router]);

  if (!hydrated || !isAdmin) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Laptop className="h-6 w-6 text-primary" />
          Virtual Internship Manager
        </h1>
        <p className="text-muted-foreground">Read-only view of virtual internship enrollments and scholarship caps.</p>
      </div>

      <div className="flex gap-2 rounded-full border border-border bg-card p-1">
        {SEGMENTS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSegment(s.key)}
            className={cn(
              'flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
              segment === s.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {segment === 'enrollments' ? <EnrollmentsList /> : <ScholarshipsList />}
    </div>
  );
}
