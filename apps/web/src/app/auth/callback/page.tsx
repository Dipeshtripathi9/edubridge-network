'use client';

import { Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVerifyMagicLink } from '@/hooks/use-auth';

function Callback() {
  const params = useSearchParams();
  const token = params.get('token');
  const router = useRouter();
  const verify = useVerifyMagicLink();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!token) {
      router.replace('/login');
      return;
    }
    verify.mutate(token);
  }, [token, router, verify]);

  if (verify.isError) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-lg font-semibold">This sign-in link is invalid or expired</p>
        <p className="text-sm text-muted-foreground">Request a fresh link from the login page.</p>
        <Button asChild>
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin text-primary" />}>
        <Callback />
      </Suspense>
    </div>
  );
}
