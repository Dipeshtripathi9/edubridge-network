'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Briefcase, GraduationCap, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileForm } from '@/components/profile-form';
import { useProfileProgress } from '@/stores/profile-progress.store';
import { useAuthStore } from '@/stores/auth.store';
import { useMe } from '@/hooks/use-profile';

const SIGNUP_INTENT_LABEL: Record<string, string> = {
  COLLEGE_ADMISSIONS: '🏫 College Admissions',
  INTERNSHIPS_JOBS: '💼 Internships & Jobs',
};

export default function ProfilePage() {
  const router = useRouter();
  const loggedIn = useAuthStore((s) => !!s.accessToken);
  const pct = useProfileProgress((s) => s.pct);
  const { data: me } = useMe();
  // Always ask which track brought them here — even mid-wizard users see the
  // two options first, every time they land on this page.
  const [track, setTrack] = useState<'picker' | 'college'>('picker');

  // Close the page: go back if there's history, otherwise fall back to Home.
  const close = () => {
    if (window.history.length > 1) router.back();
    else router.push('/home');
  };

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <b className="block font-display text-lg">Sign in to build your profile</b>
          <p className="mt-1 text-muted-foreground">Your matches, verified status and activity live here.</p>
          <div className="mt-5 flex justify-center gap-3">
            <Button asChild variant="outline"><Link href="/login">Sign in</Link></Button>
            <Button asChild><Link href="/signup">Sign up</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  const done = pct >= 100;

  const closeButton = (
    <button
      type="button"
      aria-label="Close profile"
      onClick={close}
      className="grid h-8 w-8 flex-none place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      <X className="h-5 w-5" strokeWidth={2.4} />
    </button>
  );

  if (track === 'picker') {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="mb-6 flex items-center gap-1.5 font-display text-2xl font-extrabold tracking-tight">
          {closeButton}
          <span className="truncate">Welcome to EduBridge</span>
        </h1>
        <div className="space-y-5 py-2">
          <p className="text-center text-lg font-bold">What brings you to EduBridge Network today?</p>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setTrack('college')}
              className="flex flex-col items-center gap-3.5 rounded-2xl border-[1.5px] border-border bg-card p-7 text-center transition-all hover:border-primary/60 hover:bg-primary/5"
            >
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-[17px] font-bold leading-tight">
                College
                <br />
                Admissions
              </span>
            </button>
            <button
              type="button"
              onClick={() => router.push('/verify')}
              className="flex flex-col items-center gap-3.5 rounded-2xl border-[1.5px] border-border bg-card p-7 text-center transition-all hover:border-primary/60 hover:bg-primary/5"
            >
              <Briefcase className="h-7 w-7 text-primary" />
              <span className="text-[17px] font-bold leading-tight">
                Internships &amp;
                <br />
                Jobs
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      {/* Completion header + animated progress line */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h1 className="flex min-w-0 items-center gap-1.5 font-display text-2xl font-extrabold tracking-tight">
            {closeButton}
            <span className="truncate">Your EduBridge Profile</span>
          </h1>
          <span className="font-display text-lg font-extrabold tabular-nums text-primary">{pct}%</span>
        </div>
        {me?.profile?.signupIntent && (
          <p className="mb-2 text-sm text-muted-foreground">
            Signed up for: <span className="font-semibold text-foreground">{SIGNUP_INTENT_LABEL[me.profile.signupIntent]}</span>
          </p>
        )}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-accent">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-marigold transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {done ? 'Profile complete — a counselor will reach out with your matches.' : 'Each step you finish fills your profile by 25%.'}
        </p>
      </div>

      <ProfileForm />
    </div>
  );
}
