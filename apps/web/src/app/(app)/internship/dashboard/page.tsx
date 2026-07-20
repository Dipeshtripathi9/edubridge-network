'use client';

import Link from 'next/link';
import { Award, GraduationCap, Rocket, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StageTracker } from '@/components/internship/stage-tracker';
import { PaymentBox } from '@/components/internship/payment-box';
import { TaskList, deriveTrackAStages } from '@/components/internship/task-list';
import { AllocationCard, deriveTrackBStages } from '@/components/internship/allocation-card';
import { CertificateCard } from '@/components/internship/certificate-card';
import { useMyTrackAEnrollment } from '@/hooks/use-internships';
import { useMyTrackBApplication } from '@/hooks/use-internship-applications';
import { useMyCertificates } from '@/hooks/use-certificates';
import { useAuthStore } from '@/stores/auth.store';

function GetStartedCard({
  icon: Icon,
  title,
  description,
  href,
  cta,
}: {
  icon: typeof GraduationCap;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <Card className="border-dashed">
      <CardContent className="space-y-3 p-6 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-accent text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <p className="font-display text-lg font-bold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button asChild className="w-full">
          <Link href={href}>{cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function TrackASection() {
  const { data: enrollment, isLoading } = useMyTrackAEnrollment();
  if (isLoading) return <Skeleton className="h-56 w-full" />;

  const active = enrollment && enrollment.status !== 'CANCELLED' ? enrollment : null;
  if (!active) {
    return (
      <GetStartedCard
        icon={GraduationCap}
        title="Track A — Learn & Build"
        description="Pay to learn with a mentor on a live project, or have your own idea built by EduBridge's team."
        href="/internship/dashboard/enroll"
        cta="Enroll in Track A"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">Track A — {active.subtype === 'OWN_PROJECT' ? 'Own Project' : 'Guided Learning'}</h3>
        <Link href="/internship/dashboard/enroll" className="text-sm font-semibold text-primary hover:underline">
          View details
        </Link>
      </div>
      <StageTracker stages={deriveTrackAStages(active.status, active.tasks ?? [])} />
      <PaymentBox enrollment={active} />
      {active.status !== 'PENDING_PAYMENT' && <TaskList tasks={active.tasks ?? []} />}
    </div>
  );
}

function TrackBSection() {
  const { data: application, isLoading } = useMyTrackBApplication();
  if (isLoading) return <Skeleton className="h-56 w-full" />;

  if (!application) {
    return (
      <GetStartedCard
        icon={Rocket}
        title="Track B — Apply & Get Selected"
        description="Free, merit-based. Apply and we'll allocate you paid client work or a skill-building task."
        href="/internship/dashboard/apply"
        cta="Apply to Track B"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">Track B Application</h3>
        <Link href="/internship/dashboard/apply" className="text-sm font-semibold text-primary hover:underline">
          View details
        </Link>
      </div>
      <StageTracker stages={deriveTrackBStages(application)} />
      <AllocationCard application={application} />
    </div>
  );
}

function CertificatesSection() {
  const { data: certificates, isLoading } = useMyCertificates();
  if (isLoading) return <Skeleton className="h-32 w-full" />;
  if (!certificates || certificates.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-card px-5 py-8 text-center text-sm text-muted-foreground">
        Complete a track to earn your first certificate.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {certificates.map((c) => (
        <CertificateCard key={c.id} certificate={c} />
      ))}
    </div>
  );
}

export default function InternshipDashboardPage() {
  const loggedIn = useAuthStore((s) => !!s.accessToken);

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <b className="block font-display text-lg">Sign in to see your internship</b>
          <p className="mt-1 text-muted-foreground">Track A and Track B both need a signed-in EduBridge account.</p>
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
    <div className="mx-auto max-w-2xl space-y-10">
      <div>
        <h1 className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-tight">
          <Sparkles className="h-6 w-6 text-primary" /> My Internship
        </h1>
        <p className="mt-1 text-muted-foreground">
          Your Track A enrollment, Track B application, and every certificate you&apos;ve earned.
        </p>
      </div>

      <TrackASection />
      <TrackBSection />

      <div>
        <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
          <Award className="h-5 w-5 text-primary" /> Certificates
        </h2>
        <CertificatesSection />
      </div>
    </div>
  );
}
