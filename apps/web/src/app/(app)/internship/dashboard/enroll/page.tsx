'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EnrollForm } from '@/components/internship/enroll-form';
import { PaymentBox } from '@/components/internship/payment-box';
import { TaskList, deriveTrackAStages } from '@/components/internship/task-list';
import { StageTracker } from '@/components/internship/stage-tracker';
import { useMyTrackAEnrollment } from '@/hooks/use-internships';
import { useAuthStore } from '@/stores/auth.store';

export default function EnrollTrackAPage() {
  const router = useRouter();
  const loggedIn = useAuthStore((s) => !!s.accessToken);
  const { data: enrollment, isLoading } = useMyTrackAEnrollment();

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <b className="block font-display text-lg">Sign in to enroll in Track A</b>
          <p className="mt-1 text-muted-foreground">Learn with a mentor, or have your idea built — sign in first.</p>
          <div className="mt-5 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const activeEnrollment = enrollment && enrollment.status !== 'CANCELLED' ? enrollment : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button
        type="button"
        onClick={() => router.push('/internship/dashboard')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> My Internship
      </button>

      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Track A — Learn &amp; Build</h1>
        <p className="mt-1 text-muted-foreground">
          Structured mentorship on a live project, or have EduBridge&apos;s team build your own idea.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : activeEnrollment ? (
        <div className="space-y-4">
          <StageTracker stages={deriveTrackAStages(activeEnrollment.status, activeEnrollment.tasks ?? [])} />
          <PaymentBox enrollment={activeEnrollment} />
          {activeEnrollment.status !== 'PENDING_PAYMENT' && <TaskList tasks={activeEnrollment.tasks ?? []} />}
        </div>
      ) : (
        <EnrollForm />
      )}
    </div>
  );
}
