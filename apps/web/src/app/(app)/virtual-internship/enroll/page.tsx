'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { VirtualInternshipEnrollForm } from '@/components/internship/virtual-internship-enroll-form';
import { VirtualInternshipPaymentBox } from '@/components/internship/virtual-internship-payment-box';
import { VirtualInternshipTaskBoard } from '@/components/internship/virtual-internship-task-board';
import { useMyVirtualInternshipEnrollment, type VirtualInternshipTrack } from '@/hooks/use-virtual-internship';
import { useAuthStore } from '@/stores/auth.store';

function EnrollInner() {
  const router = useRouter();
  const params = useSearchParams();
  const loggedIn = useAuthStore((s) => !!s.accessToken);
  const { data: enrollment, isLoading } = useMyVirtualInternshipEnrollment();

  const trackParam = params.get('track');
  const initialTrack: VirtualInternshipTrack | undefined =
    trackParam === 'FOUR_WEEK' || trackParam === 'FOUR_MONTH' ? trackParam : undefined;

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <b className="block font-display text-lg">Sign in to join the Virtual Internship</b>
          <p className="mt-1 text-muted-foreground">Pick your track and start building — sign in first.</p>
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
        onClick={() => router.push('/virtual-internship')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Virtual Internship
      </button>

      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Join the Virtual Internship</h1>
        <p className="mt-1 text-muted-foreground">
          Real projects, real mentors, a certificate that actually means something.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : activeEnrollment ? (
        <>
          <VirtualInternshipPaymentBox enrollment={activeEnrollment} />
          {(activeEnrollment.status === 'ACTIVE' || activeEnrollment.status === 'COMPLETED') && (
            <VirtualInternshipTaskBoard enrollment={activeEnrollment} />
          )}
        </>
      ) : (
        <VirtualInternshipEnrollForm initialTrack={initialTrack} />
      )}
    </div>
  );
}

export default function VirtualInternshipEnrollPage() {
  return (
    <Suspense fallback={<Skeleton className="mx-auto h-72 w-full max-w-2xl" />}>
      <EnrollInner />
    </Suspense>
  );
}
