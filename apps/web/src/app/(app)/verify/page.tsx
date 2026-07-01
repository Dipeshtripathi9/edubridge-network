'use client';

import { useState } from 'react';
import { BadgeCheck, Clock, ShieldCheck, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { CollegePicker, type CollegeSelection } from '@/components/college-picker';
import { useMe } from '@/hooks/use-profile';
import {
  useMyVerification,
  useSubmitVerification,
  type VerificationMethod,
} from '@/hooks/use-verification';

const METHODS: { value: VerificationMethod; label: string; hint: string }[] = [
  { value: 'COLLEGE_EMAIL', label: 'College Email', hint: 'Verify with your official college email address.' },
  { value: 'ID_CARD', label: 'Student ID Card', hint: 'Upload a photo of your student ID card.' },
  { value: 'ADMISSION_PROOF', label: 'Admission Proof', hint: 'Upload your admission/fee receipt.' },
];

export default function VerifyPage() {
  const { data: me } = useMe();
  const { data: current } = useMyVerification();
  const submit = useSubmitVerification();

  const [method, setMethod] = useState<VerificationMethod>('COLLEGE_EMAIL');
  const [college, setCollege] = useState<CollegeSelection | null>(
    me?.profile?.college ? { collegeId: me.profile.college.id, collegeName: me.profile.college.name } : null,
  );
  const [collegeEmail, setCollegeEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const verified = me?.profile && (me.profile as { collegeVerification?: string }).collegeVerification === 'VERIFIED';

  const onSubmit = () => {
    if (!college) {
      toast.error('Select your college');
      return;
    }
    if (method === 'COLLEGE_EMAIL' && !collegeEmail.trim()) {
      toast.error('Enter your college email');
      return;
    }
    if (method !== 'COLLEGE_EMAIL' && !file) {
      toast.error('Upload your document');
      return;
    }
    submit.mutate(
      {
        method,
        collegeId: college.collegeId,
        collegeName: college.collegeName,
        collegeEmail: collegeEmail || undefined,
        file,
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
          <ShieldCheck className="h-6 w-6 text-primary" />
          Student Verification
        </h1>
        <p className="text-muted-foreground">
          Verified students can post reviews, access exclusive resources, and earn higher trust.
        </p>
      </div>

      {verified ? (
        <Card>
          <CardContent className="flex items-center gap-3 p-6">
            <BadgeCheck className="h-8 w-8 text-green-500" />
            <div>
              <p className="font-semibold">You&apos;re a verified student 🎉</p>
              <p className="text-sm text-muted-foreground">
                {me?.profile?.college?.name ?? 'Your college'} verified.
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
              <p className="text-sm text-muted-foreground">
                Submitted via {current.method.replace('_', ' ').toLowerCase()}. We&apos;ll notify you when it&apos;s reviewed.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Get verified</CardTitle>
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
                    method === m.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-accent',
                  )}
                >
                  <span className="font-medium">{m.label}</span>
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              {METHODS.find((m) => m.value === method)?.hint}
            </p>

            <div className="space-y-1">
              <p className="text-sm font-medium">Your college / university</p>
              <CollegePicker value={college} onChange={setCollege} />
              <p className="text-xs text-muted-foreground">
                Pick from the list, or type your college name if it isn&apos;t there.
              </p>
            </div>

            {method === 'COLLEGE_EMAIL' ? (
              <Input
                key="college-email"
                type="email"
                placeholder="you@college.edu"
                value={collegeEmail}
                onChange={(e) => setCollegeEmail(e.target.value)}
              />
            ) : (
              <Input
                key="evidence-file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            )}

            <Button onClick={onSubmit} disabled={submit.isPending}>
              {submit.isPending ? 'Submitting…' : 'Submit for verification'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
