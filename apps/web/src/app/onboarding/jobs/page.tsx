'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { MotionProvider, m } from '@/components/motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CollegePicker, type CollegeSelection } from '@/components/college-picker';
import { GoogleVerifyButton } from '@/components/social-auth';
import { useAuthStore } from '@/stores/auth.store';
import { useSubmitVerification } from '@/hooks/use-verification';

type Step = 'gate' | 'blocked' | 'college' | 'course' | 'year' | 'verify';

const STEP_ORDER: Step[] = ['college', 'course', 'year', 'verify'];

export default function InternshipsJobsOnboardingPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const submitVerification = useSubmitVerification();

  const [step, setStep] = useState<Step>('gate');
  const [college, setCollege] = useState<CollegeSelection | null>(null);
  const [course, setCourse] = useState('');
  const [year, setYear] = useState('');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [collegeGoogleToken, setCollegeGoogleToken] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    if (hydrated && !token) router.replace('/login');
  }, [hydrated, token, router]);

  const onCollegeVerified = (credential: string, profile: { email?: string; name?: string }) => {
    if (!profile.email) {
      toast.error('Could not read your Google email — try again');
      return;
    }
    const domain = profile.email.split('@')[1]?.toLowerCase() ?? '';
    if (domain === 'gmail.com' || domain === 'googlemail.com') {
      toast.error('Use your official college email — personal Gmail isn’t accepted');
      return;
    }
    setCollegeEmail(profile.email);
    setCollegeGoogleToken(credential);
    setEmailVerified(true);
    toast.success('College email verified with Google ✓');
  };

  const finish = () => {
    submitVerification.mutate(
      {
        method: 'COLLEGE_EMAIL',
        collegeId: college?.collegeId,
        collegeName: college?.collegeName,
        collegeEmail,
        collegeEmailGoogleToken: collegeGoogleToken ?? undefined,
        course: course.trim(),
        year: Number(year) || undefined,
      },
      {
        onSuccess: () => {
          toast.success('Details saved — an admin will review your college verification shortly.');
          router.push('/home');
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-accent/20 px-4 py-10">
      <MotionProvider>
        <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <Card>
            {stepIndex >= 0 && (
              <CardHeader>
                <div className="mb-2 flex gap-1">
                  {STEP_ORDER.map((s, i) => (
                    <span key={s} className={cn('h-1.5 flex-1 rounded-full', i <= stepIndex ? 'bg-primary' : 'bg-muted')} />
                  ))}
                </div>
                <CardTitle>
                  {step === 'college'
                    ? 'Your college'
                    : step === 'course'
                      ? 'Your course'
                      : step === 'year'
                        ? 'Your year'
                        : 'Verify your college email'}
                </CardTitle>
              </CardHeader>
            )}
            <CardContent className="space-y-4">
              {step === 'gate' && (
                <m.div
                  key="gate"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 py-2 text-center"
                >
                  <p className="text-sm text-muted-foreground">
                    Internships &amp; Jobs on EduBridge is only open to students who are already enrolled in a college.
                  </p>
                  <p className="text-sm font-medium">Are you currently in college?</p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setStep('blocked')}>
                      Not yet
                    </Button>
                    <Button className="flex-1" onClick={() => setStep('college')}>
                      Yes, I&apos;m in college
                    </Button>
                  </div>
                </m.div>
              )}

              {step === 'blocked' && (
                <m.div
                  key="blocked"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 py-2 text-center"
                >
                  <p className="text-sm text-muted-foreground">
                    Internships &amp; Jobs on EduBridge is only open to students who are already enrolled in a college —
                    check back once you&apos;ve started college.
                  </p>
                  <p className="text-sm">
                    Looking for college admissions help instead?{' '}
                    <Link href="/profile" className="text-primary hover:underline">
                      Go there →
                    </Link>
                  </p>
                </m.div>
              )}

              {step === 'college' && (
                <m.div
                  key="college"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <CollegePicker value={college} onChange={setCollege} />
                  <p className="text-xs text-muted-foreground">
                    Pick from the list — a directory match is required to verify your college email next.
                  </p>
                  <Button className="w-full" disabled={!college?.collegeId} onClick={() => setStep('course')}>
                    Continue
                  </Button>
                </m.div>
              )}

              {step === 'course' && (
                <m.div
                  key="course"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <Input placeholder="Course / branch (e.g. B.Tech CSE)" value={course} onChange={(e) => setCourse(e.target.value)} />
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setStep('college')}>
                      Back
                    </Button>
                    <Button className="flex-1" disabled={!course.trim()} onClick={() => setStep('year')}>
                      Continue
                    </Button>
                  </div>
                </m.div>
              )}

              {step === 'year' && (
                <m.div
                  key="year"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                  >
                    <option value="">Select year</option>
                    {[1, 2, 3, 4, 5].map((y) => (
                      <option key={y} value={y}>
                        {y === 1 ? '1st' : y === 2 ? '2nd' : y === 3 ? '3rd' : `${y}th`} year
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setStep('course')}>
                      Back
                    </Button>
                    <Button className="flex-1" disabled={!year} onClick={() => setStep('verify')}>
                      Continue
                    </Button>
                  </div>
                </m.div>
              )}

              {step === 'verify' && (
                <m.div
                  key="verify"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  {emailVerified ? (
                    <div className="flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 p-2 text-sm text-green-700 dark:text-green-300">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>
                        Verified: <strong>{collegeEmail}</strong>
                      </span>
                    </div>
                  ) : (
                    <>
                      <GoogleVerifyButton onVerified={onCollegeVerified} />
                      <p className="text-xs text-muted-foreground">
                        Sign in with your <strong>official college email</strong> (personal Gmail isn’t accepted). The
                        verified email is saved automatically and can’t be changed manually.
                      </p>
                    </>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setStep('year')}>
                      Back
                    </Button>
                    <Button className="flex-1" disabled={!emailVerified || submitVerification.isPending} onClick={finish}>
                      {submitVerification.isPending ? 'Saving…' : 'Finish'}
                    </Button>
                  </div>
                </m.div>
              )}
            </CardContent>
          </Card>
        </m.div>
      </MotionProvider>
    </div>
  );
}
