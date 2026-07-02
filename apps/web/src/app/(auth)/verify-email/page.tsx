'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BadgeCheck, Loader2, Mail, MoveRight, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useResendVerification, useVerifyEmail } from '@/hooks/use-auth';

function VerifyByToken({ token }: { token: string }) {
  const verify = useVerifyEmail();
  const router = useRouter();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    verify.mutate(token, {
      onSuccess: () => setTimeout(() => router.push('/login'), 1500),
    });
  }, [token, verify, router]);

  if (verify.isError) {
    return (
      <CardContent className="space-y-3 py-8 text-center">
        <XCircle className="mx-auto h-10 w-10 text-destructive" />
        <p className="font-semibold">This verification link is invalid or expired</p>
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
          <p className="text-sm text-muted-foreground">Your account is ready — taking you to login…</p>
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
  const [devLink, setDevLink] = useState<string | null>(null);

  useEffect(() => {
    setDevLink(sessionStorage.getItem('ebd_verify_devlink'));
  }, []);

  const onResend = () => {
    if (!email) {
      toast.error('Missing email — sign up again');
      return;
    }
    resend.mutate(email, {
      onSuccess: (res) => {
        if (res.devLink) {
          sessionStorage.setItem('ebd_verify_devlink', res.devLink);
          setDevLink(res.devLink);
        }
        toast.success('Verification link resent.');
      },
      onError: (e) => toast.error((e as Error).message),
    });
  };

  return (
    <CardContent className="space-y-5 text-center">
      <div className="space-y-2">
        <Mail className="mx-auto h-10 w-10 text-primary" />
        <p className="text-sm text-muted-foreground">
          Click the verification link sent to{' '}
          <strong>{email || 'your Gmail account'}</strong>.
        </p>
        <MoveRight className="mx-auto h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">After verification, your account will be created automatically.</p>
      </div>

      {devLink && (
        <div className="rounded-lg border border-amber-400/50 bg-amber-50 p-3 text-sm dark:bg-amber-500/10">
          <p className="font-medium text-amber-700 dark:text-amber-300">⚠️ Email isn’t configured here.</p>
          <Button asChild className="mt-2 w-full">
            <a href={devLink}>Open verification link (dev)</a>
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Didn&apos;t receive the email?</p>
        <Button variant="outline" className="w-full" onClick={onResend} disabled={resend.isPending}>
          {resend.isPending ? 'Sending…' : 'Resend Verification'}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Log In
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
