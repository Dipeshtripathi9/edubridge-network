'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth.store';
import { useCollegeApplicationsAdmin, type CollegeApplicationAdmin } from '@/hooks/use-college-applications-admin';

function ApplicantRow({ a }: { a: CollegeApplicationAdmin }) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-3 text-sm">
      <div className="min-w-[180px] flex-1">
        <p className="font-semibold">{a.fullName ?? '—'}</p>
        <p className="text-muted-foreground">{a.state ?? '—'}</p>
      </div>
      <span className="min-w-[220px]">{a.email ?? '—'}</span>
      <span className="min-w-[160px]">{a.phone ?? '—'}</span>
      <div className="min-w-[220px] flex-1">
        <div className="flex flex-wrap gap-1.5">
          {a.colleges.map((c, i) => (
            <span key={i} className="rounded-full bg-[#E7F1EB] px-2.5 py-1 text-[12px] font-semibold text-[#1C4736]">
              {c.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApplicantsList() {
  const { data, isLoading } = useCollegeApplicationsAdmin();
  const applicants = data ?? [];

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (applicants.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">No college applications yet.</CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          <div className="flex flex-wrap gap-4 bg-muted/40 p-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="min-w-[180px] flex-1">Student / State</span>
            <span className="min-w-[220px]">Email</span>
            <span className="min-w-[160px]">Mobile number</span>
            <span className="min-w-[220px] flex-1">Colleges applied to</span>
          </div>
          {applicants.map((a) => (
            <ApplicantRow key={a.userId} a={a} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CollegeAppliedPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  useEffect(() => {
    if (hydrated && !isAdmin) router.replace('/home');
  }, [hydrated, isAdmin, router]);

  if (!hydrated || !isAdmin) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ClipboardList className="h-6 w-6 text-primary" />
          College Applied
        </h1>
        <p className="text-muted-foreground">Users and the colleges they applied to, with contact info.</p>
      </div>

      <ApplicantsList />
    </div>
  );
}
