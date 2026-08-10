'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { BadgeCheck, Briefcase, GraduationCap, Lock } from 'lucide-react';
import { MotionProvider, m } from '@/components/motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GoogleVerifyButton, googleEnabled } from '@/components/social-auth';
import { useSignup } from '@/hooks/use-auth';
import { useAuthStore } from '@/stores/auth.store';
import { sanitizeRedirect } from '@/lib/safe-redirect';

type Intent = 'college' | 'jobs';

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

function SignupInner() {
  const redirect = useSearchParams().get('redirect') ?? undefined;
  const loginHref = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login';
  const signup = useSignup();
  const setSession = useAuthStore((s) => s.setSession);
  const router = useRouter();
  const [intent, setIntent] = useState<Intent | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [gender, setGender] = useState('');
  const [homeState, setHomeState] = useState('');

  // When Google is configured, verification is required before the form opens.
  const verified = !googleEnabled || !!googleToken;

  const onVerified = (credential: string, profile: { email?: string; name?: string }) => {
    setGoogleToken(credential);
    if (profile.email) setEmail(profile.email);
    if (profile.name && !fullName) setFullName(profile.name);
    toast.success('Verified with Google — complete your details.');
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (googleEnabled && !googleToken) {
      toast.error('Verify with your Google account first');
      return;
    }
    signup.mutate(
      {
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        phone: mobile ? `+91${mobile}` : undefined,
        gender: gender || undefined,
        state: homeState || undefined,
        googleIdToken: googleToken ?? undefined,
        intent: intent === 'college' ? 'COLLEGE_ADMISSIONS' : 'INTERNSHIPS_JOBS',
        redirect,
      },
      {
        onSuccess: (res) => {
          const destination = sanitizeRedirect(redirect, intent === 'college' ? '/profile' : '/onboarding/jobs');
          // Google-verified signup returns tokens — sign the user straight in and
          // drop them right into the flow matching why they signed up (or back on
          // the page that prompted the signup, if that's where they came from).
          if (res.tokens) {
            setSession(res.tokens.accessToken, res.tokens.refreshToken, res.user);
            toast.success('Account created 🎉');
            router.push(destination);
            return;
          }
          // Fallback (no Google configured): email-verification flow. Carry the
          // intent through the query string so it survives the emailed-link round-trip.
          // `redirect` is embedded straight into that link server-side instead.
          if (res.devLink) sessionStorage.setItem('ebd_verify_devlink', res.devLink);
          toast.success('Account created — verify your email to continue.');
          router.push(`/verify-email?email=${encodeURIComponent(email.trim())}&intent=${intent}`);
        },
        onError: (err) => toast.error((err as Error).message),
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Started on EduBridge Network</CardTitle>
        <p className="text-sm text-muted-foreground">
          Sign up to boost your career with resources, opportunities, and expert guidance.
        </p>
      </CardHeader>
      <CardContent>
        <MotionProvider>
          {!intent ? (
            // Step 0 — what brought them here, before any account details.
            <m.div
              key="intent"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5 py-2"
            >
              <p className="text-center text-lg font-bold">What brings you to EduBridge Network today?</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setIntent('college')}
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
                  onClick={() => setIntent('jobs')}
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
              <p className="text-center text-base text-muted-foreground">
                Already have an account?{' '}
                <Link href={loginHref} className="font-bold text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </m.div>
          ) : googleEnabled && !verified ? (
            // Step 1 — mandatory Google verification.
            <m.div
              key="google-verify"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 py-2 text-center"
            >
              <button type="button" onClick={() => setIntent(null)} className="text-xs text-muted-foreground hover:underline">
                ‹ Change
              </button>
              <p className="text-sm text-muted-foreground">
                Verify with your Google account to continue.
              </p>
              <GoogleVerifyButton onVerified={onVerified} />
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href={loginHref} className="text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </m.div>
          ) : (
            // Step 2 — complete the account.
            <m.form
              key="account-form"
              onSubmit={onSubmit}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <button type="button" onClick={() => setIntent(null)} className="text-xs text-muted-foreground hover:underline">
                ‹ Change
              </button>
              {googleToken && (
                <div className="flex items-center gap-2 rounded-md border border-green-500/30 bg-green-500/10 p-2 text-sm text-green-700 dark:text-green-300">
                  <BadgeCheck className="h-4 w-4" /> Verified with Google
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  readOnly={!!googleToken}
                  className={googleToken ? 'cursor-not-allowed bg-muted text-muted-foreground' : undefined}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {googleToken ? (
                    <span className="inline-flex items-center gap-1">
                      <Lock className="h-3 w-3" /> From your Google account — can’t be changed.
                    </span>
                  ) : (
                    'You may receive a verification link from us.'
                  )}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Password</label>
                <Input
                  type="password"
                  placeholder="8+ chars, upper, lower, number"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>

              <div>
                <label className="text-sm font-medium">Mobile Number</label>
                <div className="flex gap-2">
                  <div className="flex h-10 w-14 flex-shrink-0 items-center justify-center rounded-md border border-input bg-muted text-sm font-medium text-muted-foreground">
                    +91
                  </div>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">State</label>
                <select
                  value={homeState}
                  onChange={(e) => setHomeState(e.target.value)}
                  required
                  className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                >
                  <option value="">Select state</option>
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              <p className="text-xs text-muted-foreground">
                By tapping Submit, you agree to create an account and accept EduBridge Network&apos;s Terms, Privacy
                Policy, and Community Policy.
              </p>

              <Button type="submit" className="w-full" disabled={signup.isPending}>
                {signup.isPending ? 'Submitting…' : 'Submit'}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link href={loginHref} className="text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </m.form>
          )}
        </MotionProvider>
      </CardContent>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupInner />
    </Suspense>
  );
}
