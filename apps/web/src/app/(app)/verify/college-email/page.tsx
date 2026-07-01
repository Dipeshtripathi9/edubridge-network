'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BadgeCheck, Loader2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useConfirmCollegeEmail } from '@/hooks/use-verification';

const LS_KEY = 'ebd_college_email_verified';

function Confirm() {
  const token = useSearchParams().get('token');
  const confirm = useConfirmCollegeEmail();
  const ran = useRef(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!token) return;
    confirm.mutate(token, {
      onSuccess: (res) => {
        setEmail(res.email);
        localStorage.setItem(LS_KEY, res.email);
      },
    });
  }, [token, confirm]);

  if (confirm.isSuccess) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6 text-center">
          <BadgeCheck className="mx-auto h-10 w-10 text-green-500" />
          <p className="font-semibold">College email verified ✓</p>
          <p className="text-sm text-muted-foreground">
            <strong>{email}</strong> is confirmed. Return to the verification form to continue.
          </p>
          <Button asChild>
            <Link href="/verify">Back to verification</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (confirm.isError || !token) {
    return (
      <Card>
        <CardContent className="space-y-3 p-6 text-center">
          <XCircle className="mx-auto h-10 w-10 text-destructive" />
          <p className="font-semibold">This link is invalid or expired</p>
          <Button asChild variant="outline">
            <Link href="/verify">Back to verification</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Confirming your college email…</p>
    </div>
  );
}

export default function CollegeEmailConfirmPage() {
  return (
    <div className="mx-auto max-w-md p-6">
      <Suspense fallback={<Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />}>
        <Confirm />
      </Suspense>
    </div>
  );
}
