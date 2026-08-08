'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { MotionProvider, m } from '@/components/motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GoogleVerifyButton } from '@/components/social-auth';
import { useAuthStore } from '@/stores/auth.store';
import { useCompleteJobsOnboarding } from '@/hooks/use-profile';

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

type Step = 1 | 2;

export default function InternshipsJobsOnboardingPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  const hydrated = useAuthStore((s) => s.hydrated);
  const completeOnboarding = useCompleteJobsOnboarding();

  const [step, setStep] = useState<Step>(1);
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [course, setCourse] = useState('');
  const [state, setState] = useState('');
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [googleEmail, setGoogleEmail] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (hydrated && !token) router.replace('/login');
  }, [hydrated, token, router]);

  const onGoogleVerified = (credential: string, profile: { email?: string }) => {
    setGoogleToken(credential);
    setGoogleEmail(profile.email ?? null);
    toast.success('Verified with Google ✓');
  };

  const canContinueStep1 = fullName.trim().length > 0 && /^\d{10}$/.test(mobile.trim());

  const submit = () => {
    if (!googleToken) {
      toast.error('Please verify with your college Google account first — this step is compulsory.');
      return;
    }
    if (!consent) {
      toast.error('Please confirm the consent checkbox to continue.');
      return;
    }
    completeOnboarding.mutate(
      {
        fullName: fullName.trim(),
        phone: mobile.trim(),
        collegeName: collegeName.trim(),
        course: course.trim(),
        state,
        idToken: googleToken,
      },
      {
        onSuccess: () => {
          toast.success("You're verified! Redirecting you to your dashboard...");
          router.push('/home');
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-accent/20 px-4 py-10">
      <MotionProvider>
        <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
          <Card>
            <CardHeader>
              <div className="mb-2 flex gap-1.5">
                <span className={cn('h-1.5 flex-1 rounded-full', step >= 1 ? 'bg-primary' : 'bg-muted')} />
                <span className={cn('h-1.5 flex-1 rounded-full', step >= 2 ? 'bg-primary' : 'bg-muted')} />
              </div>
              <p className="text-xs font-bold tracking-widest text-muted-foreground">STEP {step} OF 2</p>
              <CardTitle className="text-2xl">{step === 1 ? "Let's get you verified" : 'Verify yourself'}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {step === 1 ? (
                  <>
                    Tell us a bit about yourself so we can match you with <em>internships and opportunities</em> on
                    EduBridge.
                  </>
                ) : (
                  <>
                    This helps us confirm your <em>student status</em> and match you to the right opportunities.
                  </>
                )}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {step === 1 && (
                <m.div
                  key="step1"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <Input placeholder="e.g. Aarav Sharma" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Mobile Number</label>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">We&apos;ll send an OTP to verify this number.</p>
                  </div>
                  <Button className="w-full" disabled={!canContinueStep1} onClick={() => setStep(2)}>
                    Continue
                  </Button>
                </m.div>
              )}

              {step === 2 && (
                <m.div
                  key="step2"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-sm font-medium">College Name</label>
                    <Input
                      placeholder="e.g. Delhi Technological University"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Course Name</label>
                    <Input
                      placeholder="e.g. B.Tech Computer Science"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">State</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                    >
                      <option value="" disabled>
                        Select your state
                      </option>
                      {STATES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-4">
                    <p className="text-sm font-semibold">Verify yourself</p>
                    {googleToken ? (
                      <div className="flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 p-2 text-sm text-green-700 dark:text-green-300">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>Verified with Google{googleEmail ? `: ${googleEmail}` : ''}</span>
                      </div>
                    ) : (
                      <GoogleVerifyButton onVerified={onGoogleVerified} />
                    )}
                    <p className="text-xs text-muted-foreground">
                      Verification is compulsory and happens automatically through Google — anybody can verify with
                      any Google account, no manual review, no waiting for a link.
                    </p>
                  </div>

                  <label className="flex items-start gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-1 h-4 w-4 shrink-0"
                    />
                    <span>
                      By continuing, I confirm the details I&apos;ve shared are accurate and I consent to EduBridge
                      Network verifying my student status via Google.
                    </span>
                  </label>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button className="flex-1" disabled={completeOnboarding.isPending} onClick={submit}>
                      {completeOnboarding.isPending ? 'Saving…' : 'Submit'}
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
