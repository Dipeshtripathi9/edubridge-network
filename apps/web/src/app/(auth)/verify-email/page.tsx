'use client';

import { Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BadgeCheck, Loader2, Mail, MoveRight, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useResendVerification, useVerifyEmail } from '@/hooks/use-auth';

function VerifyByToken({ token }: { token: string }) {
  const verify = useVerifyEmail();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    // On success the hook signs the user in and redirects to /onboarding.
    verify.mutate(token);
  }, [token, verify]);

  if (verify.isError) {
    return (
      <CardContent className="space-y-3 py-8 text-center">
        <XCircle className="mx-auto h-10 w-10 text-destructive" />
        <p className="font-semibold">This verification link is invalid or expired</p>
        <p className="text-sm text-muted-foreground">
          Links expire 15 minutes after they’re sent. Request a fresh one below.
        </p>
        <Button asChild variant="outline">
          <Link href="/verify-email">Request a new link</Link>
        </Button>
      </CardContent>
    );
  }

  return (
    <CardContent className="space-y-3 py-8 text-center">
      {verify.isSuccess ? (
        <>
          <BadgeCheck className="mx-auto h-10 w-10 text-green-500" />
          <p className="font-semibold">Email verified 🎉</p>
          <p className="text-sm text-muted-foreground">
            Your account is ready — signing you in…
          </p>
        </>
      ) : (
        <>
          <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying your email…</p>
        </>
      )}
    </CardContent>
  );
}

function CheckInbox({ email }: { email: string }) {
  const resend = useResendVerification();

  const onResend = () => {
    if (!email) {
      toast.error('Missing email — sign up again');
      return;
    }
    resend.mutate(email, {
      onSuccess: () => toast.success('Verification link resent — check your inbox.'),
      onError: (e) => toast.error((e as Error).message),
    });
  };

  return (
    <CardContent className="space-y-5 text-center">
      <div className="space-y-2">
        <Mail className="mx-auto h-10 w-10 text-primary" />
        <p className="text-sm text-muted-foreground">
          We’ve sent a verification link to{' '}
          <strong>{email || 'your email address'}</strong>.
        </p>
        <MoveRight className="mx-auto h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Click it to activate your account — you’ll be signed in automatically. The link
          expires in 15 minutes.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Didn&apos;t receive the email?</p>
        <Button variant="outline" className="w-full" onClick={onResend} disabled={resend.isPending}>
          {resend.isPending ? 'Sending…' : 'Resend verification link'}
        </Button>
        <Button asChild variant="ghost" className="w-full">
          <Link href="/signup">Use a different email</Link>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Already verified?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Log in
        </Link>
      </p>
    </CardContent>
  );
}

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params.get('token');
  const email = params.get('email') ?? '';
  return token ? <VerifyByToken token={token} /> : <CheckInbox email={email} />;
}

export default function VerifyEmailPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Verify Your Email</CardTitle>
      </CardHeader>
      <Suspense fallback={<div className="py-8 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" /></div>}>
        <VerifyEmailInner />
      </Suspense>
    </Card>
  );
}
