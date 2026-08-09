'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GoogleAuthButton } from '@/components/social-auth';
import { useLogin } from '@/hooks/use-auth';

function LoginInner() {
  const redirect = useSearchParams().get('redirect') ?? undefined;
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate({ email, password, redirectTo: redirect }, { onError: (err) => toast.error((err as Error).message) });
  };

  const signupHref = redirect ? `/signup?redirect=${encodeURIComponent(redirect)}` : '/signup';

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Log in to EduBridge</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Email ID"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? 'Logging in…' : 'Login'}
          </Button>
        </form>

        <GoogleAuthButton mode="login" redirectTo={redirect} />

        <Button asChild variant="outline" className="w-full">
          <Link href={signupHref}>Create New Account</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
