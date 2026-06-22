'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { INTEREST_OPTIONS } from '@edubridge/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import { useCompleteOnboarding } from '@/hooks/use-profile';
import { useSubmitVerification } from '@/hooks/use-verification';

export default function OnboardingPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const onboard = useCompleteOnboarding();
  const submitVerification = useSubmitVerification();

  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({
    fullName: '',
    course: '',
    branch: '',
    year: 1,
    cgpa: 0,
    state: '',
    city: '',
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [collegeEmail, setCollegeEmail] = useState('');

  useEffect(() => {
    if (hydrated && !token) router.replace('/login');
  }, [hydrated, token, router]);

  const toggleInterest = (i: string) =>
    setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  // Completes the profile, optionally submitting a campus-email verification request.
  const finish = (withEmail?: string) => {
    onboard.mutate(
      { ...profile, year: Number(profile.year), cgpa: Number(profile.cgpa), interests },
      {
        onSuccess: async () => {
          if (withEmail) {
            try {
              await submitVerification.mutateAsync({
                method: 'COLLEGE_EMAIL',
                collegeEmail: withEmail,
              });
              toast.success('Profile ready! Verification submitted for review.');
            } catch (e) {
              toast.error(`Profile saved, but verification failed: ${(e as Error).message}`);
            }
          } else {
            toast.success('Profile ready!');
          }
          router.push('/dashboard');
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  const busy = onboard.isPending || submitVerification.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-accent/20 px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <Card>
          <CardHeader>
            <div className="mb-2 flex gap-1">
              {[0, 1, 2].map((s) => (
                <span
                  key={s}
                  className={cn('h-1.5 flex-1 rounded-full', s <= step ? 'bg-primary' : 'bg-muted')}
                />
              ))}
            </div>
            <CardTitle>
              {step === 0
                ? 'Set up your profile'
                : step === 1
                  ? 'Pick your interests'
                  : 'Verify your campus'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 0 ? (
              <div className="space-y-3">
                <Input
                  placeholder="Full name"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Course (B.Tech)"
                    value={profile.course}
                    onChange={(e) => setProfile({ ...profile, course: e.target.value })}
                  />
                  <Input
                    placeholder="Branch (CSE)"
                    value={profile.branch}
                    onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="number"
                    min={1}
                    max={6}
                    placeholder="Year"
                    value={profile.year || ''}
                    onChange={(e) => setProfile({ ...profile, year: Number(e.target.value) })}
                  />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="CGPA"
                    value={profile.cgpa || ''}
                    onChange={(e) => setProfile({ ...profile, cgpa: Number(e.target.value) })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="State"
                    value={profile.state}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  />
                  <Input
                    placeholder="City"
                    value={profile.city}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  />
                </div>
                <Button className="w-full" onClick={() => setStep(1)} disabled={!profile.fullName}>
                  Continue
                </Button>
              </div>
            ) : step === 1 ? (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((i) => (
                    <button
                      key={i}
                      onClick={() => toggleInterest(i)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-sm transition-colors',
                        interests.includes(i)
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-accent',
                      )}
                    >
                      {i}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={() => setStep(2)}>
                    Continue
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Verify with your <span className="font-medium text-foreground">official campus email</span> to
                    contribute to your campus community — write reviews, join discussions, and create polls &amp; pools.
                    An admin reviews your request. You can also do this later from your dashboard.
                  </p>
                </div>
                <Input
                  type="email"
                  placeholder="you@college.edu"
                  value={collegeEmail}
                  onChange={(e) => setCollegeEmail(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => finish()}
                    disabled={busy}
                  >
                    Skip for now
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => finish(collegeEmail.trim())}
                    disabled={busy || !collegeEmail.trim()}
                  >
                    {busy ? 'Saving…' : 'Verify & finish'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
