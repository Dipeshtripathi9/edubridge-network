'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ApplyForm } from '@/components/internship/apply-form';
import { AllocationCard, deriveTrackBStages } from '@/components/internship/allocation-card';
import { StageTracker } from '@/components/internship/stage-tracker';
import { useMyTrackBApplication } from '@/hooks/use-internship-applications';
import { useAuthStore } from '@/stores/auth.store';

export default function ApplyTrackBPage() {
  const router = useRouter();
  const loggedIn = useAuthStore((s) => !!s.accessToken);
  const { data: application, isLoading } = useMyTrackBApplication();

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <b className="block font-display text-lg">Sign in to apply for Track B</b>
          <p className="mt-1 text-muted-foreground">Free, merit-based — sign in to submit your application.</p>
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
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Track B — Apply &amp; Get Selected</h1>
        <p className="mt-1 text-muted-foreground">
          Free to apply. If selected, we allocate you either paid client work or a skill-building
          task — both lead to a verifiable certificate.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : application ? (
        <div className="space-y-4">
          <StageTracker stages={deriveTrackBStages(application)} />
          <AllocationCard application={application} />
        </div>
      ) : (
        <ApplyForm />
      )}
    </div>
  );
}
