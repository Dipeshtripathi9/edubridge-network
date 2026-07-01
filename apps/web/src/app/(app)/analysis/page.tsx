'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BarChart3, ChevronDown, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useVerificationAnalysis } from '@/hooks/use-verification';

const FB = [
  { key: 'placements', label: 'Placements & career outcomes' },
  { key: 'culture', label: 'Student culture & peer group' },
  { key: 'faculty', label: 'Faculty & learning quality' },
  { key: 'roi', label: 'ROI (fees vs placements)' },
  { key: 'location', label: 'Location & industry exposure' },
];

export default function AnalysisPage() {
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const { data, isLoading } = useVerificationAnalysis();
  const [open, setOpen] = useState<string | null>(null);

  if (!isAdmin) {
    return <p className="py-16 text-center text-muted-foreground">Admins only.</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <BarChart3 className="h-6 w-6 text-primary" /> Student Insights
        </h1>
        <p className="text-muted-foreground">
          Honest feedback from verified students, grouped by college/university.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No verified-student feedback yet. It appears here once verified students submit their reviews.
        </p>
      ) : (
        <div className="space-y-3">
          {data.map((group) => {
            const isOpen = open === group.college;
            return (
              <Card key={group.college} className="overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : group.college)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-accent"
                >
                  <span className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <GraduationCap className="h-5 w-5" />
                    </span>
                    <span className="font-semibold">{group.college}</span>
                    <Badge variant="secondary">
                      {group.students.length} student{group.students.length === 1 ? '' : 's'}
                    </Badge>
                  </span>
                  <ChevronDown className={cn('h-5 w-5 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')} />
                </button>

                {isOpen && (
                  <CardContent className="space-y-4 border-t border-border p-4">
                    {group.students.map((s) => (
                      <div key={s.id} className="rounded-lg border border-border p-3">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium">{s.user.profile?.fullName ?? s.user.email}</span>
                          {s.user.profile?.branch && <Badge variant="secondary">{s.user.profile.branch}</Badge>}
                          {s.user.profile?.year && <Badge variant="secondary">Year {s.user.profile.year}</Badge>}
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {FB.filter((f) => s.feedback?.[f.key]).map((f) => (
                            <div key={f.key} className="rounded-md bg-muted/40 p-2">
                              <p className="text-xs font-medium">{f.label}</p>
                              <p className="mt-0.5 text-sm text-muted-foreground">{s.feedback![f.key]}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Need to review pending requests?{' '}
        <Link href="/admin" className="text-primary hover:underline">
          Go to Admin → Verification
        </Link>
      </p>
    </div>
  );
}
