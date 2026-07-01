'use client';

import { useEffect, useState } from 'react';
import { BadgeCheck, CheckCircle2, Clock, Lock, ShieldCheck, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CollegePicker, type CollegeSelection } from '@/components/college-picker';
import { useMe } from '@/hooks/use-profile';
import {
  useConfirmCollegeEmail,
  useMyVerification,
  useRequestCollegeEmail,
  useSubmitVerification,
  type VerificationMethod,
} from '@/hooks/use-verification';

const METHODS: { value: VerificationMethod; label: string; hint: string }[] = [
  { value: 'COLLEGE_EMAIL', label: 'College Email', hint: 'Verify with your official college email address.' },
  { value: 'ID_CARD', label: 'Student ID Card', hint: 'Upload a photo of your student ID card.' },
  { value: 'ADMISSION_PROOF', label: 'Admission Proof', hint: 'Upload your admission / fee receipt.' },
];

const FEEDBACK_FIELDS: { key: string; label: string }[] = [
  { key: 'placements', label: 'Placements & career outcomes' },
  { key: 'culture', label: 'Student culture & peer group' },
  { key: 'faculty', label: 'Faculty & learning quality' },
  { key: 'roi', label: 'ROI (fees vs placements)' },
  { key: 'location', label: 'Location & industry exposure' },
];

const LS_KEY = 'ebd_college_email_verified';

export default function VerifyPage() {
  const { data: me, refetch: refetchMe } = useMe();
  const { data: current, refetch: refetchCurrent } = useMyVerification();

  // Always fetch fresh status when opening this page (and on focus), so an admin's
  // approval reflects immediately instead of showing a stale "pending".
  useEffect(() => {
    const refresh = () => {
      refetchMe();
      refetchCurrent();
    };
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [refetchMe, refetchCurrent]);
  const submit = useSubmitVerification();
  const requestEmail = useRequestCollegeEmail();
  const confirmEmail = useConfirmCollegeEmail();

  const [step, setStep] = useState<1 | 2>(1);
  const [method, setMethod] = useState<VerificationMethod>('COLLEGE_EMAIL');
  const [college, setCollege] = useState<CollegeSelection | null>(
    me?.profile?.college ? { collegeId: me.profile.college.id, collegeName: me.profile.college.name } : null,
  );
  const [course, setCourse] = useState(me?.profile?.branch ?? '');
  const [year, setYear] = useState<string>(me?.profile?.year ? String(me.profile.year) : '');
  const [collegeEmail, setCollegeEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [linkSent, setLinkSent] = useState<{ devLink?: string } | null>(null);
  const [driveUrl, setDriveUrl] = useState('');
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  const verified = me?.profile && (me.profile as { collegeVerification?: string }).collegeVerification === 'VERIFIED';

  // Pick up email confirmation done in the /verify/college-email tab.
  useEffect(() => {
    const check = () => {
      const v = localStorage.getItem(LS_KEY);
      if (v && collegeEmail && v.toLowerCase() === collegeEmail.toLowerCase()) setEmailVerified(true);
    };
    check();
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    return () => {
      window.removeEventListener('focus', check);
      document.removeEventListener('visibilitychange', check);
    };
  }, [collegeEmail]);

  const authenticate = () => {
    if (!collegeEmail.trim()) {
      toast.error('Enter your college email first');
      return;
    }
    localStorage.removeItem(LS_KEY);
    setEmailVerified(false);
    requestEmail.mutate(collegeEmail.trim(), {
      onSuccess: (res) => {
        setLinkSent({ devLink: res.devLink });
        toast.success('Verification link sent to your college email.');
      },
      onError: (e) => toast.error((e as Error).message),
    });
  };

  const goToStep2 = () => {
    if (!college) return toast.error('Select your college');
    if (!course.trim()) return toast.error('Enter your course / branch');
    if (!year) return toast.error('Select your year');
    if (method === 'COLLEGE_EMAIL' && !emailVerified) return toast.error('Authenticate your college email first');
    if (method !== 'COLLEGE_EMAIL' && !/^https?:\/\//i.test(driveUrl.trim()))
      return toast.error('Paste a valid Google Drive link');
    setStep(2);
  };

  const onSubmit = () => {
    const missing = FEEDBACK_FIELDS.filter((f) => !(feedback[f.key] ?? '').trim());
    if (missing.length > 0) {
      toast.error(`Please fill all fields — missing: ${missing.map((f) => f.label).join(', ')}`);
      return;
    }
    submit.mutate(
      {
        method,
        collegeId: college?.collegeId,
        collegeName: college?.collegeName,
        collegeEmail: method === 'COLLEGE_EMAIL' ? collegeEmail : undefined,
        collegeEmailVerified: emailVerified,
        feedback,
        course: course.trim(),
        year: Number(year) || undefined,
        evidenceUrl: driveUrl.trim(),
      },
      {
        onSuccess: () => toast.success('Submitted — an admin will review it shortly'),
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <ShieldCheck className="h-6 w-6 text-primary" /> Student Verification
        </h1>
        <p className="text-muted-foreground">
          Verified students can post reviews, lead communities, access exclusive resources and earn higher trust.
        </p>
      </div>

      {verified ? (
        <Card>
          <CardContent className="flex items-center gap-3 p-6">
            <BadgeCheck className="h-10 w-10 shrink-0 text-green-500" />
            <div>
              <p className="flex items-center gap-1 font-semibold">
                You are a verified student
                <BadgeCheck className="h-4 w-4 text-green-500" />
              </p>
              <p className="text-sm text-muted-foreground">
                of <strong>{me?.profile?.college?.name ?? 'your college'}</strong> — verified by EduBridge Network.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : current && current.status === 'PENDING' ? (
        <Card>
          <CardContent className="flex items-center gap-3 p-6">
            <Clock className="h-8 w-8 text-amber-500" />
            <div>
              <p className="font-semibold">Verification pending</p>
              <p className="text-sm text-muted-foreground">We&apos;ll notify you once an admin reviews it.</p>
            </div>
          </CardContent>
        </Card>
      ) : step === 1 ? (
        <Card>
          <CardHeader>
            <CardTitle>Get verified · Step 1 of 2</CardTitle>
            {current?.status === 'REJECTED' && (
              <p className="flex items-center gap-1 text-sm text-destructive">
                <XCircle className="h-4 w-4" /> Previous request declined{current.note ? `: ${current.note}` : ''}. Try again.
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-3">
              {METHODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMethod(m.value)}
                  className={cn(
                    'rounded-lg border p-3 text-left text-sm transition-colors',
                    method === m.value ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent',
                  )}
                >
                  <span className="font-medium">{m.label}</span>
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{METHODS.find((m) => m.value === method)?.hint}</p>

            <div className="space-y-1">
              <p className="text-sm font-medium">Your college / university</p>
              <CollegePicker value={college} onChange={setCollege} />
              <p className="text-xs text-muted-foreground">Pick from the list, or type your college name if it isn&apos;t there.</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Course / branch</label>
                <Input placeholder="e.g. B.Tech CSE" value={course} onChange={(e) => setCourse(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Year of study</label>
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
              </div>
            </div>

            {method === 'COLLEGE_EMAIL' ? (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="you@college.edu"
                    value={collegeEmail}
                    disabled={emailVerified}
                    onChange={(e) => {
                      setCollegeEmail(e.target.value);
                      setEmailVerified(false);
                      setLinkSent(null);
                    }}
                  />
                  {emailVerified ? (
                    <span className="flex shrink-0 items-center gap-1 rounded-md bg-green-500/15 px-3 text-sm font-medium text-green-600">
                      <CheckCircle2 className="h-4 w-4" /> Verified
                    </span>
                  ) : (
                    <Button variant="outline" className="shrink-0" onClick={authenticate} disabled={requestEmail.isPending}>
                      Authenticate
                    </Button>
                  )}
                </div>
                {linkSent && !emailVerified && (
                  <div className="rounded-lg border border-amber-400/50 bg-amber-50 p-3 text-sm dark:bg-amber-500/10">
                    <p>📧 We sent a verification link to <strong>{collegeEmail}</strong>. Open it to confirm.</p>
                    {linkSent.devLink && (
                      <Button
                        size="sm"
                        className="mt-2"
                        disabled={confirmEmail.isPending}
                        onClick={() => {
                          const token = linkSent.devLink!.split('token=')[1] ?? '';
                          confirmEmail.mutate(token, {
                            onSuccess: () => {
                              setEmailVerified(true);
                              setLinkSent(null);
                              toast.success('College email verified ✓');
                            },
                            onError: (e) => toast.error((e as Error).message),
                          });
                        }}
                      >
                        {confirmEmail.isPending ? 'Verifying…' : 'Open verification link (dev)'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <Input
                  type="url"
                  placeholder="https://drive.google.com/… (link to your document)"
                  value={driveUrl}
                  onChange={(e) => setDriveUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Upload your {method === 'ID_CARD' ? 'student ID card' : 'admission / fee receipt'} to Google Drive,
                  set sharing to <strong>“Anyone with the link”</strong>, and paste the link here.
                </p>
              </div>
            )}

            <Button onClick={goToStep2} disabled={submit.isPending} className="w-full sm:w-auto">
              Continue →
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Your honest experience · Step 2 of 2</CardTitle>
            <p className="text-sm text-muted-foreground">
              Share true thoughts about your college. This helps us understand what you need — and gives new students
              real insight from you.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {FEEDBACK_FIELDS.map((f) => (
              <div key={f.key} className="space-y-1">
                <label className="text-sm font-medium">
                  {f.label} <span className="text-destructive">*</span>
                </label>
                <Textarea
                  placeholder={`Your honest take on ${f.label.toLowerCase()}…`}
                  value={feedback[f.key] ?? ''}
                  onChange={(e) => setFeedback((cur) => ({ ...cur, [f.key]: e.target.value }))}
                />
              </div>
            ))}

            <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <p>
                Your personal data is never shared with anyone. Provide honest information only — misleading reviews
                will <strong>not be verified</strong> by EduBridge Network.
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                ← Back
              </Button>
              <Button
                onClick={onSubmit}
                disabled={submit.isPending || FEEDBACK_FIELDS.some((f) => !(feedback[f.key] ?? '').trim())}
              >
                {submit.isPending ? 'Submitting…' : 'Submit for verification'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
