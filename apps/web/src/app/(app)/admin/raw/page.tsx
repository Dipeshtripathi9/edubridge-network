'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Database } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth.store';
import { useAdminUsers, type AdminUser } from '@/hooks/use-admin';
import { cn } from '@/lib/utils';

type Segment = 'COLLEGE_ADMISSIONS' | 'INTERNSHIPS_JOBS';

// Bare-bones list — gmail, contact number, and state only, nothing else —
// split by signup intent. Its own page (not an Admin Panel tab) so it can
// be linked to directly; not surfaced anywhere outside the admin nav.
function RawRow({ u }: { u: AdminUser }) {
  return (
    <div className="flex flex-wrap items-center gap-4 p-3 text-sm">
      <span className="min-w-[220px] flex-1 truncate">{u.email ?? '—'}</span>
      <span className="min-w-[160px] truncate">{u.phone ?? '—'}</span>
      <span className="min-w-[120px] truncate">{u.profile?.state ?? '—'}</span>
    </div>
  );
}

function RawList({ intent }: { intent: Segment }) {
  const { data, isLoading } = useAdminUsers({ signupIntent: intent });
  const users = data?.data ?? [];

  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">No signups yet.</CardContent>
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
          {users.map((u) => (
            <RawRow key={u.id} u={u} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

const SEGMENTS: { key: Segment; label: string }[] = [
  { key: 'COLLEGE_ADMISSIONS', label: 'Find College' },
  { key: 'INTERNSHIPS_JOBS', label: 'Explore Internship' },
];

export default function AdminRawPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const [segment, setSegment] = useState<Segment>('COLLEGE_ADMISSIONS');

  useEffect(() => {
    if (hydrated && !isAdmin) router.replace('/home');
  }, [hydrated, isAdmin, router]);

  if (!hydrated || !isAdmin) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Database className="h-6 w-6 text-primary" />
          Raw
        </h1>
        <p className="text-muted-foreground">Gmail, contact number, and state — by signup intent.</p>
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

      <RawList intent={segment} />
    </div>
  );
}
