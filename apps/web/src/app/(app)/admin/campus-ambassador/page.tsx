'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Users as UsersIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils';
import {
  useCampusAmbassadorApplications,
  useCampusAmbassadorReferrals,
  useCampusAmbassadorSettings,
  useCampusAmbassadors,
  useDecideCampusAmbassadorApplication,
  useSetCampusAmbassadorSettings,
} from '@/hooks/use-campus-ambassador';

function CampusAmbassadorSettingsToggle() {
  const { data } = useCampusAmbassadorSettings();
  const setSettings = useSetCampusAmbassadorSettings();
  const open = data?.applicationsOpen ?? true;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
      <div>
        <p className="text-sm font-semibold">Applications are {open ? 'open' : 'closed'}</p>
        <p className="text-xs text-muted-foreground">
          Students can{open ? '' : 'not'} currently apply to become a Campus Ambassador.
        </p>
      </div>
      <Button
        size="sm"
        variant={open ? 'destructive' : 'default'}
        disabled={setSettings.isPending}
        onClick={() =>
          setSettings.mutate(!open, {
            onSuccess: () => toast.success(open ? 'Applications closed' : 'Applications opened'),
            onError: (e) => toast.error((e as Error).message),
          })
        }
      >
        {open ? 'Close applications' : 'Open applications'}
      </Button>
    </div>
  );
}

function CampusAmbassadorApplicationsSection() {
  const { data, isLoading } = useCampusAmbassadorApplications('PENDING');
  const decide = useDecideCampusAmbassadorApplication();
  const applications = data?.data ?? [];

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">No pending applications.</CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {applications.map((a) => (
        <Card key={a.id}>
          <CardContent className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{a.user?.profile?.fullName ?? a.user?.email ?? 'Student'}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {a.user?.email ?? '—'} · {a.user?.phone ?? '—'} · {a.user?.profile?.state ?? '—'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    decide.mutate(
                      { id: a.id, approve: false },
                      { onSuccess: () => toast.success('Rejected'), onError: (e) => toast.error((e as Error).message) },
                    )
                  }
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    decide.mutate(
                      { id: a.id, approve: true },
                      { onSuccess: () => toast.success('Approved'), onError: (e) => toast.error((e as Error).message) },
                    )
                  }
                >
                  Approve
                </Button>
              </div>
            </div>
            <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm">{a.reason}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CampusAmbassadorAmbassadorsSection() {
  const { data, isLoading } = useCampusAmbassadors();
  const ambassadors = data ?? [];

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (ambassadors.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">No campus ambassadors yet.</CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          <div className="flex flex-wrap gap-4 bg-muted/40 p-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="min-w-[220px] flex-1">Gmail</span>
            <span className="min-w-[160px]">Contact number</span>
            <span className="min-w-[120px]">State</span>
          </div>
          {ambassadors.map((a) => (
            <div key={a.userId} className="flex flex-wrap items-center gap-4 p-3 text-sm">
              <span className="min-w-[220px] flex-1 truncate">{a.email ?? '—'}</span>
              <span className="min-w-[160px] truncate">{a.phone ?? '—'}</span>
              <span className="min-w-[120px] truncate">{a.state ?? '—'}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CampusAmbassadorReferralsSection() {
  const { data, isLoading } = useCampusAmbassadorReferrals();
  const rows = data ?? [];

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">No campus ambassadors yet.</CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          <div className="flex flex-wrap gap-4 bg-muted/40 p-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="min-w-[220px] flex-1">Ambassador</span>
            <span className="min-w-[120px]">Code</span>
            <span className="min-w-[140px]">Referrals</span>
          </div>
          {rows.map((r) => (
            <div key={r.userId} className="flex flex-wrap items-center gap-4 p-3 text-sm">
              <span className="min-w-[220px] flex-1 truncate">{r.fullName ?? r.email ?? '—'}</span>
              <span className="min-w-[120px] truncate">{r.referralCode ?? '—'}</span>
              <span className="min-w-[140px] font-semibold">{r.referralCount}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const CAMPUS_AMBASSADOR_SEGMENTS = [
  { key: 'applications', label: 'Applications' },
  { key: 'ambassadors', label: 'Ambassadors' },
  { key: 'referrals', label: 'Referrals' },
] as const;

export default function AdminCampusAmbassadorPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const [segment, setSegment] = useState<(typeof CAMPUS_AMBASSADOR_SEGMENTS)[number]['key']>('applications');

  useEffect(() => {
    if (hydrated && !isAdmin) router.replace('/home');
  }, [hydrated, isAdmin, router]);

  if (!hydrated || !isAdmin) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <UsersIcon className="h-6 w-6 text-primary" />
          Campus Ambassador
        </h1>
        <p className="text-muted-foreground">Applications, ambassadors, and referral counts.</p>
      </div>

      <CampusAmbassadorSettingsToggle />

      <div className="flex gap-2 rounded-full border border-border bg-card p-1">
        {CAMPUS_AMBASSADOR_SEGMENTS.map((s) => (
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

      {segment === 'applications' && <CampusAmbassadorApplicationsSection />}
      {segment === 'ambassadors' && <CampusAmbassadorAmbassadorsSection />}
      {segment === 'referrals' && <CampusAmbassadorReferralsSection />}
    </div>
  );
}
